const { supabase, toCamelCase, toSnakeCase } = require('../utils/supabaseHelper');
const notificationService = require('./notificationService');

class StockService {
  /**
   * Recalculates and updates stock for an equipment item
   */
  static async recalculateStock(equipmentId) {
    const { data: itemRaw, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', equipmentId)
      .single();

    if (error || !itemRaw) throw new Error('Equipment not found');

    const total = itemRaw.total_quantity || 0;
    const issued = itemRaw.issued_quantity || 0;
    const damaged = itemRaw.damaged_quantity || 0;
    const lost = itemRaw.lost_quantity || 0;
    const minStock = itemRaw.minimum_stock || 5;

    const available = Math.max(0, total - (issued + damaged + lost));
    let status = 'In Stock';
    if (available === 0) {
      status = 'Out of Stock';
    } else if (available <= minStock) {
      status = 'Low Stock';
    }

    const { data: updatedRaw } = await supabase
      .from('equipment')
      .update({
        available_quantity: available,
        status
      })
      .eq('id', equipmentId)
      .select()
      .single();

    if (available <= minStock) {
      await notificationService.notifyLowStock(itemRaw.name, available, minStock);
    }

    return toCamelCase(updatedRaw);
  }

  /**
   * Issue equipment to a student
   */
  static async issueEquipment({ student, equipmentId, quantity, expectedReturnDate, purpose, remarks, issuedBy }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    const { data: eqRaw, error: eqErr } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', equipmentId)
      .single();

    if (eqErr || !eqRaw) {
      throw new Error('Equipment item not found');
    }

    if (eqRaw.available_quantity < qty) {
      throw new Error(`Insufficient equipment available. Requested: ${qty}, Available: ${eqRaw.available_quantity}`);
    }

    // Deduct stock
    const newIssued = (eqRaw.issued_quantity || 0) + qty;
    const available = Math.max(0, eqRaw.total_quantity - (newIssued + (eqRaw.damaged_quantity || 0) + (eqRaw.lost_quantity || 0)));

    let status = 'In Stock';
    if (available === 0) {
      status = 'Out of Stock';
    } else if (available <= eqRaw.minimum_stock) {
      status = 'Low Stock';
    }

    const { data: updatedEqRaw } = await supabase
      .from('equipment')
      .update({
        issued_quantity: newIssued,
        available_quantity: available,
        status
      })
      .eq('id', equipmentId)
      .select()
      .single();

    // Create transaction record
    const { data: txRaw, error: txErr } = await supabase
      .from('equipment_transactions')
      .insert({
        student_id: student.id,
        student_name: student.name,
        register_number: student.registerNumber,
        equipment_id: equipmentId,
        equipment_name: eqRaw.name,
        quantity: qty,
        issue_date: new Date().toISOString(),
        expected_return_date: new Date(expectedReturnDate).toISOString(),
        status: 'Issued',
        return_condition: 'Pending',
        purpose: purpose || 'College Practice / Match',
        remarks: remarks || '',
        issued_by: issuedBy || 'Sports Incharge'
      })
      .select()
      .single();

    if (txErr) {
      throw new Error(txErr.message);
    }

    const transaction = toCamelCase(txRaw);
    const equipment = toCamelCase(updatedEqRaw);

    // Notification to student
    await notificationService.notifyEquipmentIssued(
      student.id,
      eqRaw.name,
      qty,
      expectedReturnDate
    );

    if (available <= eqRaw.minimum_stock) {
      await notificationService.notifyLowStock(eqRaw.name, available, eqRaw.minimum_stock);
    }

    return { transaction, equipment };
  }

  /**
   * Return equipment with condition evaluation
   */
  static async returnEquipment({ transactionId, returnCondition, damageDescription, fineAmount, remarks }) {
    const { data: txRaw, error: txErr } = await supabase
      .from('equipment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txErr || !txRaw) {
      throw new Error('Transaction record not found');
    }

    if (txRaw.status === 'Returned' || txRaw.status === 'Damaged' || txRaw.status === 'Lost') {
      throw new Error('This equipment has already been returned or processed.');
    }

    const { data: eqRaw, error: eqErr } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', txRaw.equipment_id)
      .single();

    if (eqErr || !eqRaw) {
      throw new Error('Associated equipment not found');
    }

    const qty = txRaw.quantity;
    let newStatus = 'Returned';
    let damagedInc = 0;
    let lostInc = 0;

    if (returnCondition === 'Good') {
      newStatus = 'Returned';
    } else if (returnCondition === 'Damaged') {
      newStatus = 'Damaged';
      damagedInc = qty;
    } else if (returnCondition === 'Lost') {
      newStatus = 'Lost';
      lostInc = qty;
    } else if (returnCondition === 'Partially Damaged') {
      newStatus = 'Returned';
      damagedInc = 1;
    }

    const newIssued = Math.max(0, (eqRaw.issued_quantity || 0) - qty);
    const newDamaged = (eqRaw.damaged_quantity || 0) + damagedInc;
    const newLost = (eqRaw.lost_quantity || 0) + lostInc;
    const available = Math.max(0, eqRaw.total_quantity - (newIssued + newDamaged + newLost));

    let eqStatus = 'In Stock';
    if (available === 0) {
      eqStatus = 'Out of Stock';
    } else if (available <= eqRaw.minimum_stock) {
      eqStatus = 'Low Stock';
    }

    const { data: updatedEqRaw } = await supabase
      .from('equipment')
      .update({
        issued_quantity: newIssued,
        damaged_quantity: newDamaged,
        lost_quantity: newLost,
        available_quantity: available,
        status: eqStatus
      })
      .eq('id', eqRaw.id)
      .select()
      .single();

    const { data: updatedTxRaw } = await supabase
      .from('equipment_transactions')
      .update({
        status: newStatus,
        return_date: new Date().toISOString(),
        return_condition: returnCondition || 'Good',
        damage_description: damageDescription || '',
        fine_amount: parseFloat(fineAmount) || 0,
        remarks: remarks ? (txRaw.remarks ? `${txRaw.remarks} | ${remarks}` : remarks) : txRaw.remarks
      })
      .eq('id', transactionId)
      .select()
      .single();

    return {
      transaction: toCamelCase(updatedTxRaw),
      equipment: toCamelCase(updatedEqRaw)
    };
  }
}

module.exports = StockService;
