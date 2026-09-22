/**
 * Admin / Sports Incharge Portal Management Script
 */

let currentAdminUser = null;
let selectedAdminPhotoFile = null;
let allSportsCache = [];
let allEquipmentCache = [];
let allStudentsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  currentAdminUser = getCurrentUser();
  const token = localStorage.getItem('gasc_token');

  if (!token || !currentAdminUser || currentAdminUser.role !== 'admin') {
    showToast('Please login with Sports Incharge / Admin credentials.', 'warning', 'Admin Privileges Required');
    setTimeout(() => {
      const loginUrl = window.location.protocol === 'file:' ? 'admin-login.html' : '/admin/login';
      window.location.href = loginUrl;
    }, 500);
    return;
  }

  // Set initial topbar info from cache
  const nameEl = document.getElementById('admin-display-name');
  if (nameEl && currentAdminUser.name) nameEl.innerText = currentAdminUser.name;

  const avatarEl = document.getElementById('admin-header-avatar');
  if (avatarEl && currentAdminUser.profilePhoto) avatarEl.src = currentAdminUser.profilePhoto;

  // Sync latest live profile and settings from backend
  await syncAdminHeaderAndSettings();

  initAdminTabs();
  await loadCaches();
  loadAdminDashboard();
});

async function syncAdminHeaderAndSettings() {
  try {
    const res = await apiRequest('/settings');
    if (res && res.settings) {
      const s = res.settings;
      const nameEl = document.getElementById('admin-display-name');
      if (nameEl && s.sportsInchargeName) nameEl.innerText = s.sportsInchargeName;

      const roleEl = document.getElementById('admin-display-role');
      if (roleEl && s.sportsInchargeRole) roleEl.innerText = s.sportsInchargeRole;

      const coachInput = document.getElementById('add-sport-coach-input');
      if (coachInput && s.sportsInchargeName) coachInput.value = s.sportsInchargeName;

      const photoSrc = s.sportsInchargePhoto || s.profilePhoto || currentAdminUser?.profilePhoto;
      const avatarEl = document.getElementById('admin-header-avatar');
      if (avatarEl && photoSrc) avatarEl.src = photoSrc;

      if (currentAdminUser) {
        if (s.sportsInchargeName) currentAdminUser.name = s.sportsInchargeName;
        if (photoSrc) currentAdminUser.profilePhoto = photoSrc;
        localStorage.setItem('gasc_user', JSON.stringify(currentAdminUser));
      }
    }
  } catch (err) {
    console.warn('Could not sync admin settings header:', err);
  }
}

async function loadCaches() {
  try {
    const [sportsRes, eqRes, playersRes] = await Promise.all([
      apiRequest('/sports'),
      apiRequest('/equipment'),
      apiRequest('/players?limit=200')
    ]);
    allSportsCache = sportsRes.sports || [];
    allEquipmentCache = eqRes.equipment || [];
    allStudentsCache = playersRes.players || [];
    populateSelectDropdowns();
  } catch (err) {
    console.error('Error loading caches:', err);
  }
}

function populateSelectDropdowns() {
  // Populate Sports dropdowns
  const sportSelects = document.querySelectorAll('.populate-sports-select');
  sportSelects.forEach(sel => {
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Select Sport Discipline --</option>' +
      allSportsCache.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
    if (currentVal) sel.value = currentVal;
  });

  const teamFilterSport = document.getElementById('team-filter-sport');
  if (teamFilterSport) {
    teamFilterSport.innerHTML = '<option value="All">All Sports Disciplines</option>' +
      allSportsCache.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  }

  // Populate Equipment dropdowns
  const eqSelects = document.querySelectorAll('.populate-equipment-select');
  eqSelects.forEach(sel => {
    sel.innerHTML = '<option value="">-- Select Equipment Item --</option>' +
      allEquipmentCache.map(e => `<option value="${e._id}">${e.name} (${e.code}) — Available: ${e.availableQuantity}</option>`).join('');
  });

  // Populate Students dropdowns
  const studentSelects = document.querySelectorAll('.populate-students-select');
  studentSelects.forEach(sel => {
    sel.innerHTML = '<option value="">-- Select Student Player --</option>' +
      allStudentsCache.map(s => `<option value="${s.registerNumber}">${s.name} (${s.registerNumber} - ${s.department})</option>`).join('');
  });
}

// Navigation & Tab Switcher
function initAdminTabs() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      switchAdminView(targetView);
    });
  });
}

function switchAdminView(viewId) {
  document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.admin-nav-item[data-view="${viewId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.admin-view-section').forEach(sec => sec.classList.add('d-none'));
  const targetSec = document.getElementById(`view-${viewId}`);
  if (targetSec) targetSec.classList.remove('d-none');

  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar && sidebar.classList.contains('show')) {
    sidebar.classList.remove('show');
  }

  // Load section
  if (viewId === 'dashboard') loadAdminDashboard();
  else if (viewId === 'players') loadAdminPlayers();
  else if (viewId === 'roster') loadAdminRoster();
  else if (viewId === 'sports') loadAdminSports();
  else if (viewId === 'equipment') loadAdminEquipment();
  else if (viewId === 'issue-return') loadAdminIssueReturn();
  else if (viewId === 'competitions') loadAdminCompetitions();
  else if (viewId === 'applications') loadAdminApplications();
  else if (viewId === 'teams') loadAdminTeams();
  else if (viewId === 'achievements') loadAdminAchievements();
  else if (viewId === 'notifications') loadAdminNotifications();
  else if (viewId === 'gallery') loadAdminGallery();
  else if (viewId === 'analytics') loadAdminAnalytics();
  else if (viewId === 'reports') loadAdminReports();
  else if (viewId === 'settings') loadAdminSettings();
}

// 1. Dashboard
async function loadAdminDashboard() {
  try {
    const res = await apiRequest('/analytics/dashboard');
    const { kpis, aiInsights, recentRegistrations, recentTransactions } = res;

    document.getElementById('kpi-total-players').innerText = kpis.totalPlayers;
    document.getElementById('kpi-active-sports').innerText = kpis.totalSports;
    document.getElementById('kpi-total-equipment').innerText = kpis.totalEquipment;
    document.getElementById('kpi-issued-equipment').innerText = kpis.issuedEquipment;
    document.getElementById('kpi-low-stock').innerText = kpis.lowStockCount;
    document.getElementById('kpi-pending-apps').innerText = kpis.pendingApplications;
    document.getElementById('kpi-upcoming-comps').innerText = kpis.upcomingCompetitions;
    document.getElementById('kpi-total-achievements').innerText = kpis.totalAchievements;

    // AI Sports Insights Card
    const insightsContainer = document.getElementById('admin-ai-insights-list');
    if (insightsContainer) {
      if (!aiInsights || aiInsights.length === 0) {
        insightsContainer.innerHTML = `<div class="p-3 text-muted">Aggregating sports department data for insights...</div>`;
      } else {
        insightsContainer.innerHTML = aiInsights.map(item => `
          <div class="glass-card ai-insight-card p-3 mb-2">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="fw-bold text-dark"><i class="bi ${item.icon} text-${item.color} me-2"></i>${item.title}</span>
              <span class="badge badge-glass-${item.color}">${item.badge}</span>
            </div>
            <div class="small text-secondary">${item.message}</div>
          </div>
        `).join('');
      }
    }

    // Recent Registrations Feed
    const regFeed = document.getElementById('admin-recent-reg-feed');
    if (regFeed) {
      if (!recentRegistrations || recentRegistrations.length === 0) {
        regFeed.innerHTML = `<div class="p-3 text-muted small">No recent registrations.</div>`;
      } else {
        regFeed.innerHTML = recentRegistrations.map(r => `
          <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
            <div>
              <strong>${r.studentId ? r.studentId.name : 'Student'}</strong> (${r.studentId ? r.studentId.department : ''})
              <div class="small text-muted">${r.competitionId ? r.competitionId.name : 'Competition'} &bull; ${formatDate(r.registrationDate)}</div>
            </div>
            <span class="badge ${r.status === 'Approved' ? 'badge-glass-success' : (r.status === 'Rejected' ? 'badge-glass-danger' : 'badge-glass-warning')}">${r.status}</span>
          </div>
        `).join('');
      }
    }

    // Recent Equipment Transactions
    const txFeed = document.getElementById('admin-recent-tx-feed');
    if (txFeed) {
      if (!recentTransactions || recentTransactions.length === 0) {
        txFeed.innerHTML = `<div class="p-3 text-muted small">No recent equipment transactions.</div>`;
      } else {
        txFeed.innerHTML = recentTransactions.map(t => `
          <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
            <div>
              <strong>${t.equipmentName}</strong> (${t.quantity} unit) &rarr; ${t.studentName}
              <div class="small text-muted">Issued: ${formatDate(t.issueDate)} &bull; Due: ${formatDate(t.expectedReturnDate)}</div>
            </div>
            <span class="badge badge-glass-primary">${t.status}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
  }
}

// 2. Players Management
async function loadAdminPlayers() {
  const search = document.getElementById('player-search-input') ? document.getElementById('player-search-input').value : '';
  const dept = document.getElementById('player-filter-dept') ? document.getElementById('player-filter-dept').value : 'All';
  const year = document.getElementById('player-filter-year') ? document.getElementById('player-filter-year').value : 'All';
  const status = document.getElementById('player-filter-status') ? document.getElementById('player-filter-status').value : 'All';

  const table = document.getElementById('admin-players-table');
  try {
    const res = await apiRequest(`/players?search=${encodeURIComponent(search)}&department=${dept}&year=${year}&status=${status}`);
    allStudentsCache = res.players || [];
    populateSelectDropdowns();

    if (!res.players || res.players.length === 0) {
      table.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No student players found.</td></tr>`;
      return;
    }

    table.innerHTML = res.players.map((p, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${p.profilePhoto || 'images/default-avatar.png'}" class="rounded-circle" width="36" height="36" style="object-fit:cover;" onerror="this.src='images/default-avatar.png'">
            <div>
              <strong class="d-block text-dark">${p.name}</strong>
              <small class="text-muted">${p.registerNumber}</small>
            </div>
          </div>
        </td>
        <td>${p.department}<br><small class="text-muted">${p.year} (${p.section})</small></td>
        <td>${p.profile && p.profile.primarySport ? p.profile.primarySport.name : '<span class="text-muted">General</span>'}</td>
        <td>${p.profile ? p.profile.position : 'All Rounder'}</td>
        <td><span class="badge ${p.status === 'Active' ? 'badge-glass-success' : 'badge-glass-danger'}">${p.status}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="viewPlayerDetails('${p._id}')" title="View Full Profile"><i class="bi bi-eye"></i></button>
            <button class="btn btn-outline-danger" onclick="deletePlayer('${p._id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load players.</td></tr>`;
  }
}

async function viewPlayerDetails(id) {
  try {
    const res = await apiRequest(`/players/${id}`);
    const { player, profile, stats, equipmentHistory, attendanceRecords, achievements } = res;

    document.getElementById('modal-player-avatar').src = player.profilePhoto || 'images/default-avatar.png';
    document.getElementById('modal-player-name').innerText = player.name;
    document.getElementById('modal-player-reg').innerText = `${player.registerNumber} &bull; ${player.department} &bull; ${player.year}`;
    document.getElementById('modal-player-phone').innerText = player.mobile || 'N/A';
    document.getElementById('modal-player-email').innerText = player.email;
    document.getElementById('modal-player-status').innerHTML = `<span class="badge ${player.status === 'Active' ? 'badge-glass-success' : 'badge-glass-danger'}">${player.status}</span>`;

    document.getElementById('modal-player-sport').innerText = profile && profile.primarySport ? profile.primarySport.name : 'General Athletics';
    document.getElementById('modal-player-position').innerText = profile ? profile.position : 'All Rounder';
    document.getElementById('modal-player-jersey').innerText = profile ? `#${profile.jerseyNumber}` : '#7';
    document.getElementById('modal-player-level').innerText = profile ? profile.playingLevel : 'College Level';

    document.getElementById('modal-player-medals-count').innerText = stats.achievementsCount || 0;
    document.getElementById('modal-player-active-gear').innerText = stats.activeEquipmentCount || 0;

    const modal = new bootstrap.Modal(document.getElementById('playerDetailsModal'));
    modal.show();
  } catch (err) {
    showToast('Failed to load player profile', 'error');
  }
}

async function deletePlayer(id, name) {
  if (!confirm(`Are you sure you want to delete player "${name}"? This action cannot be undone.`)) return;
  try {
    await apiRequest(`/players/${id}`, 'DELETE');
    showToast(`Player "${name}" deleted.`, 'info');
    loadAdminPlayers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. Sports Management
async function loadAdminSports() {
  const table = document.getElementById('admin-sports-table');
  try {
    const res = await apiRequest('/sports');
    allSportsCache = res.sports || [];
    populateSelectDropdowns();

    table.innerHTML = res.sports.map((s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${s.icon || 'bi-trophy'} text-success fs-5"></i>
            <strong class="text-dark">${s.name}</strong>
          </div>
        </td>
        <td><span class="badge badge-glass-primary">${s.category}</span></td>
        <td>${s.indoorOutdoor}</td>
        <td>${s.playerCount} Per Side</td>
        <td>${s.registeredPlayersCount || 0} Players</td>
        <td><span class="badge ${s.status === 'Active' ? 'badge-glass-success' : 'badge-glass-danger'}">${s.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteSport('${s._id}', '${s.name.replace(/'/g, "\\'")}')" title="Delete"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load sports.</td></tr>`;
  }
}

async function submitCreateSport(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

    const res = await apiRequest('/sports', 'POST', formData, true);
    showToast(res.message, 'success');
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addSportModal')).hide();
    loadAdminSports();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Sport';
  }
}

async function deleteSport(id, name) {
  if (!confirm(`Delete sport discipline "${name}"?`)) return;
  try {
    await apiRequest(`/sports/${id}`, 'DELETE');
    showToast(`Sport "${name}" removed.`, 'info');
    loadAdminSports();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Equipment Inventory (Automatic Stock Calculation)
async function loadAdminEquipment() {
  const table = document.getElementById('admin-equipment-table');
  const lowStockOnly = document.getElementById('eq-filter-low-stock') ? document.getElementById('eq-filter-low-stock').checked : false;

  try {
    const res = await apiRequest(`/equipment?lowStock=${lowStockOnly}`);
    allEquipmentCache = res.equipment || [];
    populateSelectDropdowns();

    if (!res.equipment || res.equipment.length === 0) {
      table.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No equipment found matching criteria.</td></tr>`;
      return;
    }

    table.innerHTML = res.equipment.map((e, idx) => {
      const isLowStock = e.availableQuantity <= e.minimumStock;
      return `
        <tr class="${isLowStock ? 'table-warning' : ''}">
          <td>${idx + 1}</td>
          <td>
            <strong>${e.name}</strong>
            <div class="small text-muted">Code: <span class="font-monospace">${e.code}</span> &bull; ${e.sportName || 'Sport'}</div>
          </td>
          <td><span class="badge badge-glass-primary">${e.category}</span></td>
          <td><strong>${e.totalQuantity}</strong></td>
          <td>
            <span class="fs-6 fw-bold ${isLowStock ? 'text-danger' : 'text-success'}">
              ${e.availableQuantity}
            </span>
          </td>
          <td>${e.issuedQuantity}</td>
          <td>${e.damagedQuantity}</td>
          <td>
            <span class="badge ${isLowStock ? 'badge-glass-danger pulse-low-stock' : 'badge-glass-success'}">
              ${isLowStock ? '⚠️ Low Stock' : 'In Stock'}
            </span>
            <small class="d-block text-muted">Min: ${e.minimumStock}</small>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="openIssueModalFor('${e._id}')" title="Issue Gear"><i class="bi bi-box-arrow-right"></i></button>
              <button class="btn btn-outline-danger" onclick="deleteEquipment('${e._id}', '${e.name.replace(/'/g, "\\'")}')" title="Delete"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load equipment inventory.</td></tr>`;
  }
}

async function submitCreateEquipment(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

    const res = await apiRequest('/equipment', 'POST', formData, true);
    showToast(res.message, 'success');
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addEquipmentModal')).hide();
    loadAdminEquipment();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Add Equipment';
  }
}

async function deleteEquipment(id, name) {
  if (!confirm(`Delete equipment item "${name}"?`)) return;
  try {
    await apiRequest(`/equipment/${id}`, 'DELETE');
    showToast(`Equipment "${name}" deleted.`, 'info');
    loadAdminEquipment();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Issue & Return System
async function loadAdminIssueReturn() {
  const table = document.getElementById('admin-transactions-table');
  const statusFilter = document.getElementById('tx-filter-status') ? document.getElementById('tx-filter-status').value : 'All';

  try {
    const res = await apiRequest(`/equipment/transactions?status=${statusFilter}`);
    if (!res.transactions || res.transactions.length === 0) {
      table.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No equipment issue/return records found.</td></tr>`;
      return;
    }

    table.innerHTML = res.transactions.map((t, idx) => `
      <tr class="${t.isOverdue ? 'table-danger' : ''}">
        <td>${idx + 1}</td>
        <td>
          <strong>${t.studentName}</strong>
          <div class="small text-muted">${t.registerNumber}</div>
        </td>
        <td>
          <strong>${t.equipmentName}</strong>
          <div class="small text-muted">${t.quantity} unit(s)</div>
        </td>
        <td>${formatDate(t.issueDate)}</td>
        <td>
          <span class="${t.isOverdue ? 'badge bg-danger pulse-low-stock' : ''}">
            ${formatDate(t.expectedReturnDate)} ${t.isOverdue ? '(OVERDUE)' : ''}
          </span>
        </td>
        <td><span class="badge ${t.status === 'Issued' ? 'badge-glass-warning' : 'badge-glass-success'}">${t.status}</span></td>
        <td>${t.returnDate ? formatDate(t.returnDate) : '-'}</td>
        <td>
          ${t.status === 'Issued' ? `
            <button class="btn btn-sm btn-sports-accent" onclick="openReturnModal('${t._id}', '${t.equipmentName.replace(/'/g, "\\'")}', '${t.studentName.replace(/'/g, "\\'")}')">
              <i class="bi bi-box-arrow-in-left me-1"></i> Process Return
            </button>
          ` : `<span class="badge badge-glass-success">${t.returnCondition || 'Returned'}</span>`}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load transactions.</td></tr>`;
  }
}

function openIssueModalFor(eqId) {
  const sel = document.getElementById('issue-equipment-select');
  if (sel) sel.value = eqId;
  const modal = new bootstrap.Modal(document.getElementById('issueEquipmentModal'));
  modal.show();
}

async function submitIssueEquipment(event) {
  event.preventDefault();
  const studentIdentifier = document.getElementById('issue-student-select').value || document.getElementById('issue-student-manual').value;
  const equipmentId = document.getElementById('issue-equipment-select').value;
  const quantity = document.getElementById('issue-quantity').value;
  const expectedReturnDate = document.getElementById('issue-return-date').value;
  const purpose = document.getElementById('issue-purpose').value;
  const remarks = document.getElementById('issue-remarks').value;

  if (!studentIdentifier || !equipmentId || !expectedReturnDate) {
    showToast('Please specify student, equipment, and expected return date.', 'warning');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';

    const res = await apiRequest('/equipment/issue', 'POST', {
      studentIdentifier,
      equipmentId,
      quantity,
      expectedReturnDate,
      purpose,
      remarks
    });

    showToast(res.message, 'success', 'Equipment Issued');
    event.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('issueEquipmentModal')).hide();
    loadAdminIssueReturn();
    loadAdminEquipment();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Confirm Issue';
  }
}

let currentReturnTxId = null;

function openReturnModal(txId, eqName, studentName) {
  currentReturnTxId = txId;
  document.getElementById('return-modal-title').innerText = `Return: ${eqName} (${studentName})`;
  document.getElementById('return-condition').value = 'Good';
  document.getElementById('return-damage-desc').value = '';
  document.getElementById('return-fine').value = 0;
  document.getElementById('return-remarks').value = '';
  const modal = new bootstrap.Modal(document.getElementById('returnEquipmentModal'));
  modal.show();
}

async function submitReturnEquipment() {
  if (!currentReturnTxId) return;
  const condition = document.getElementById('return-condition').value;
  const damageDescription = document.getElementById('return-damage-desc').value;
  const fineAmount = document.getElementById('return-fine').value;
  const remarks = document.getElementById('return-remarks').value;
  const btn = document.getElementById('btn-confirm-return');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';

    const res = await apiRequest('/equipment/return', 'POST', {
      transactionId: currentReturnTxId,
      returnCondition: condition,
      damageDescription,
      fineAmount,
      remarks
    });

    showToast(res.message, 'success', 'Return Processed');
    bootstrap.Modal.getInstance(document.getElementById('returnEquipmentModal')).hide();
    loadAdminIssueReturn();
    loadAdminEquipment();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Complete Return';
  }
}

// 6. Competitions
async function loadAdminCompetitions() {
  const table = document.getElementById('admin-competitions-table');
  try {
    const res = await apiRequest('/competitions');
    table.innerHTML = res.competitions.map((c, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong class="text-dark">${c.name}</strong>
          <div class="small text-muted">${c.sportName} &bull; ${c.type}</div>
        </td>
        <td>${formatDate(c.date)}<br><small class="text-muted">${c.startTime}</small></td>
        <td>${c.venue}</td>
        <td><span class="text-danger fw-bold">${formatDate(c.registrationEnd)}</span></td>
        <td>${c.currentRegistrations || 0} / ${c.maxParticipants}</td>
        <td><span class="badge badge-glass-success">${c.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCompetition('${c._id}', '${c.name.replace(/'/g, "\\'")}')" title="Delete"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load competitions.</td></tr>`;
  }
}

async function submitCreateCompetition(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Publishing...';

    const res = await apiRequest('/competitions', 'POST', formData, true);
    showToast(res.message, 'success');
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addCompetitionModal')).hide();
    loadAdminCompetitions();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create & Publish';
  }
}

async function deleteCompetition(id, name) {
  if (!confirm(`Delete competition "${name}"?`)) return;
  try {
    await apiRequest(`/competitions/${id}`, 'DELETE');
    showToast(`Competition "${name}" deleted.`, 'info');
    loadAdminCompetitions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 7. Applications Management
async function loadAdminApplications() {
  const table = document.getElementById('admin-applications-table');
  const status = document.getElementById('app-filter-status') ? document.getElementById('app-filter-status').value : 'All';

  try {
    const res = await apiRequest(`/competitions/registrations/all?status=${status}`);
    if (!res.registrations || res.registrations.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No student applications found.</td></tr>`;
      return;
    }

    table.innerHTML = res.registrations.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${r.studentId ? r.studentId.name : 'Student'}</strong>
          <div class="small text-muted">${r.studentId ? r.studentId.registerNumber : ''} &bull; ${r.studentId ? r.studentId.department : ''}</div>
        </td>
        <td>
          <strong>${r.competitionId ? r.competitionId.name : 'Competition'}</strong>
          <div class="small text-muted">${r.competitionId ? r.competitionId.sportName : ''}</div>
        </td>
        <td>${r.preferredPosition || 'Player'}</td>
        <td>${formatDate(r.registrationDate)}</td>
        <td><span class="badge ${r.status === 'Approved' ? 'badge-glass-success' : (r.status === 'Rejected' ? 'badge-glass-danger' : 'badge-glass-warning')}">${r.status}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success" onclick="updateAppStatus('${r._id}', 'Approved')" title="Approve"><i class="bi bi-check-lg"></i> Approve</button>
            <button class="btn btn-outline-danger" onclick="updateAppStatus('${r._id}', 'Rejected')" title="Reject"><i class="bi bi-x-lg"></i> Reject</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load applications.</td></tr>`;
  }
}

async function updateAppStatus(id, newStatus) {
  const remarks = prompt(`Enter remarks for ${newStatus} application:`, newStatus === 'Approved' ? 'Selected for team trials.' : 'Exceeded tournament capacity.');
  if (remarks === null) return; // cancelled

  try {
    const res = await apiRequest(`/competitions/registrations/${id}/status`, 'PATCH', {
      status: newStatus,
      adminRemarks: remarks
    });
    showToast(res.message, 'success');
    loadAdminApplications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 8. Teams Management (Captain Name, Which Sport, Department, Year, Phone No)
async function loadAdminTeams() {
  const tbody = document.getElementById('admin-teams-table');
  if (!tbody) return;

  const search = (document.getElementById('team-search-input')?.value || '').trim();
  const sportId = document.getElementById('team-filter-sport')?.value || 'All';
  const dept = document.getElementById('team-filter-dept')?.value || 'All';
  const year = document.getElementById('team-filter-year')?.value || 'All';

  let url = '/teams?';
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (sportId && sportId !== 'All') params.push(`sportId=${encodeURIComponent(sportId)}`);
  if (dept && dept !== 'All') params.push(`department=${encodeURIComponent(dept)}`);
  if (year && year !== 'All') params.push(`year=${encodeURIComponent(year)}`);
  url += params.join('&');

  try {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm me-2"></span>Loading college teams...</td></tr>';
    const res = await apiRequest(url);
    const teams = res.teams || [];

    if (teams.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5 text-secondary">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-2" style="width: 48px; height: 48px; font-size: 1.5rem;">
              <i class="bi bi-shield-shaded"></i>
            </div>
            <div class="fw-bold text-dark">No College Teams Found</div>
            <small class="text-muted">Click "Add New Team" above to create a team with Captain Name, Sport, Department, and Year.</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = teams.map((t, idx) => `
      <tr>
        <td class="text-muted small">${idx + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary" style="width: 34px; height: 34px; font-size: 0.95rem;">
              <i class="bi bi-person-fill"></i>
            </div>
            <div>
              <div class="fw-bold text-dark">${t.captainName}</div>
              <small class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-star-fill text-warning me-1"></i>Team Captain</small>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-glass-primary fs-6">${t.sportName}</span>
        </td>
        <td>
          <span class="badge bg-secondary bg-opacity-15 text-dark border border-secondary border-opacity-25 px-2 py-1">${t.department}</span>
        </td>
        <td>
          <span class="fw-semibold text-dark">${t.year}</span>
        </td>
        <td>
          ${t.phone ? `<a href="tel:${t.phone}" class="text-decoration-none text-success fw-semibold"><i class="bi bi-telephone-fill me-1"></i>${t.phone}</a>` : '<span class="text-muted small">N/A</span>'}
        </td>
        <td>
          <span class="badge bg-success bg-opacity-15 text-success border border-success border-opacity-50 px-2 py-1">
            <i class="bi bi-check-circle-fill me-1"></i>${t.status || 'Active'}
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteTeam('${t._id}', '${t.captainName.replace(/'/g, "\\'")}', '${t.sportName.replace(/'/g, "\\'")}')" title="Disband Team">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading teams:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger"><i class="bi bi-exclamation-triangle me-1"></i> Failed to load teams: ${err.message}</td></tr>`;
  }
}

async function submitCreateTeam(event) {
  event.preventDefault();
  const form = event.target;
  const captainName = document.getElementById('team-captain-name').value;
  const sportId = document.getElementById('team-sport-select').value;
  const department = document.getElementById('team-department').value;
  const year = document.getElementById('team-year').value;
  const phone = document.getElementById('team-phone').value;

  const btn = document.getElementById('btn-create-team-submit') || form.querySelector('button[type="submit"]');

  if (!captainName || !sportId || !department || !year) {
    showToast('Please fill in all required fields (Captain Name, Sport, Department, Year).', 'warning', 'Missing Fields');
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Creating Team...';
    }

    const res = await apiRequest('/teams', 'POST', {
      captainName,
      sportId,
      department,
      year,
      phone
    });

    showToast(res.message, 'success', 'Team Created');
    form.reset();
    const modalEl = document.getElementById('addTeamModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
    await loadAdminTeams();
  } catch (err) {
    showToast(err.message, 'error', 'Creation Failed');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Save & Form Team';
    }
  }
}

async function deleteTeam(id, captainName, sportName) {
  if (!confirm(`Are you sure you want to delete the ${sportName} team with Captain "${captainName}"?`)) return;
  try {
    const res = await apiRequest(`/teams/${id}`, 'DELETE');
    showToast(res.message, 'info', 'Team Removed');
    await loadAdminTeams();
  } catch (err) {
    showToast(err.message, 'error', 'Delete Failed');
  }
}

// 11. Achievements
async function loadAdminAchievements() {
  const table = document.getElementById('admin-achievements-table');
  try {
    const res = await apiRequest('/achievements');
    table.innerHTML = res.achievements.map((a, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${a.title}</strong>
          <div class="small text-muted">${a.sportName || 'Athletics'} &bull; ${a.year}</div>
        </td>
        <td><strong>${a.studentName}</strong> (${a.department || 'GASC'})</td>
        <td><span class="badge ${a.medal === 'Gold' ? 'badge-gold' : (a.medal === 'Silver' ? 'badge-silver' : 'badge-bronze')}">${a.medal}</span></td>
        <td>${a.position}</td>
        <td>${formatDate(a.date)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteAchievement('${a._id}')" title="Delete"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load achievements.</td></tr>`;
  }
}

async function submitCreateAchievement(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Awarding...';

    const res = await apiRequest('/achievements', 'POST', formData, true);
    showToast(res.message, 'success');
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addAchievementModal')).hide();
    loadAdminAchievements();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Add to Wall of Fame';
  }
}

async function deleteAchievement(id) {
  if (!confirm('Delete achievement record?')) return;
  try {
    await apiRequest(`/achievements/${id}`, 'DELETE');
    showToast('Achievement deleted.', 'info');
    loadAdminAchievements();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 12. Notifications Broadcast
async function loadAdminNotifications() {
  const container = document.getElementById('admin-notifications-list');
  try {
    const res = await apiRequest('/notifications/all');
    container.innerHTML = res.notifications.map(n => `
      <div class="glass-card p-3 mb-2 d-flex align-items-center justify-content-between">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge ${n.priority === 'Urgent' ? 'bg-danger' : 'badge-glass-primary'}">${n.category}</span>
            <span class="small text-muted">${formatDate(n.createdAt)} &bull; Target: ${n.targetType}</span>
          </div>
          <h6 class="fw-bold mb-1">${n.title}</h6>
          <div class="small text-secondary">${n.message}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${n._id}')"><i class="bi bi-trash"></i></button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-center text-danger">Failed to load notifications.</div>`;
  }
}

async function submitCreateNotification(event) {
  event.preventDefault();
  const title = document.getElementById('notify-title').value;
  const message = document.getElementById('notify-message').value;
  const category = document.getElementById('notify-category').value;
  const targetType = document.getElementById('notify-target').value;
  const priority = document.getElementById('notify-priority').value;

  const btn = event.target.querySelector('button[type="submit"]');
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Broadcasting...';

    const res = await apiRequest('/notifications', 'POST', {
      title,
      message,
      category,
      targetType,
      priority
    });

    showToast(res.message, 'success');
    event.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('addNotificationModal')).hide();
    loadAdminNotifications();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Broadcast Alert';
  }
}

async function deleteNotification(id) {
  try {
    await apiRequest(`/notifications/${id}`, 'DELETE');
    showToast('Notification deleted.', 'info');
    loadAdminNotifications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 13. Gallery
async function loadAdminGallery() {
  const container = document.getElementById('admin-gallery-grid');
  try {
    const res = await apiRequest('/gallery');
    container.innerHTML = res.gallery.map(g => `
      <div class="col-md-4 mb-3">
        <div class="glass-card overflow-hidden h-100">
          <img src="${g.image}" class="w-100" style="height: 180px; object-fit: cover;">
          <div class="p-3 d-flex flex-column">
            <span class="badge badge-glass-primary mb-1 align-self-start">${g.category}</span>
            <h6 class="fw-bold mb-1">${g.title}</h6>
            <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
              <small class="text-muted">${formatDate(g.date)}</small>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem('${g._id}')"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load gallery.</div>`;
  }
}

async function submitCreateGallery(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Uploading...';

    const res = await apiRequest('/gallery', 'POST', formData, true);
    showToast(res.message, 'success');
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addGalleryModal')).hide();
    loadAdminGallery();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Upload Photo';
  }
}

async function deleteGalleryItem(id) {
  if (!confirm('Remove photo from sports gallery?')) return;
  try {
    await apiRequest(`/gallery/${id}`, 'DELETE');
    showToast('Photo removed.', 'info');
    loadAdminGallery();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 14. Analytics
async function loadAdminAnalytics() {
  await initAdminCharts();
}

// 15. Reports Center
async function generateMasterReport(type) {
  const container = document.getElementById('report-output-container');
  try {
    container.innerHTML = `<div class="p-5 text-center"><div class="spinner-border text-primary"></div><div class="mt-2 text-muted">Compiling official sports department report...</div></div>`;

    const res = await apiRequest(`/reports/${type}`);
    const { reportTitle, college, department, incharge, generatedAt, count, data } = res;

    let tableHeaders = '';
    let tableRows = '';

    if (type === 'players') {
      tableHeaders = '<th>#</th><th>Register No</th><th>Player Name</th><th>Department</th><th>Year</th><th>Section</th><th>Gender</th><th>Mobile</th><th>Status</th>';
      tableRows = data.map((d, i) => `
        <tr>
          <td>${i + 1}</td><td><strong>${d.registerNumber}</strong></td><td>${d.name}</td><td>${d.department}</td>
          <td>${d.year}</td><td>${d.section}</td><td>${d.gender}</td><td>${d.mobile}</td><td>${d.status}</td>
        </tr>
      `).join('');
    } else if (type === 'equipment-stock') {
      tableHeaders = '<th>#</th><th>Code</th><th>Equipment Name</th><th>Discipline</th><th>Total</th><th>Available</th><th>Issued</th><th>Damaged</th><th>Status</th>';
      tableRows = data.map((d, i) => `
        <tr>
          <td>${i + 1}</td><td><strong>${d.code}</strong></td><td>${d.name}</td><td>${d.sportName}</td>
          <td>${d.totalQuantity}</td><td><strong class="${d.availableQuantity <= d.minimumStock ? 'text-danger' : 'text-success'}">${d.availableQuantity}</strong></td>
          <td>${d.issuedQuantity}</td><td>${d.damagedQuantity}</td><td>${d.status}</td>
        </tr>
      `).join('');
    } else if (type === 'equipment-transactions') {
      tableHeaders = '<th>#</th><th>Student</th><th>Register No</th><th>Equipment</th><th>Qty</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th>';
      tableRows = data.map((d, i) => `
        <tr>
          <td>${i + 1}</td><td>${d.studentName}</td><td>${d.registerNumber}</td><td>${d.equipmentName}</td>
          <td>${d.quantity}</td><td>${formatDate(d.issueDate)}</td><td>${formatDate(d.expectedReturnDate)}</td>
          <td>${d.returnDate ? formatDate(d.returnDate) : '-'}</td><td>${d.status}</td>
        </tr>
      `).join('');
    } else if (type === 'competitions') {
      tableHeaders = '<th>#</th><th>Tournament Name</th><th>Sport</th><th>Level</th><th>Venue</th><th>Date</th><th>Registrations</th><th>Status</th>';
      tableRows = data.map((d, i) => `
        <tr>
          <td>${i + 1}</td><td><strong>${d.name}</strong></td><td>${d.sportName}</td><td>${d.level}</td>
          <td>${d.venue}</td><td>${formatDate(d.date)}</td><td>${d.currentRegistrations || 0}</td><td>${d.status}</td>
        </tr>
      `).join('');
    } else if (type === 'achievements') {
      tableHeaders = '<th>#</th><th>Medal</th><th>Achievement Title</th><th>Student Athlete</th><th>Department</th><th>Sport</th><th>Year</th>';
      tableRows = data.map((d, i) => `
        <tr>
          <td>${i + 1}</td><td><strong>${d.medal}</strong></td><td>${d.title}</td><td>${d.studentName}</td>
          <td>${d.department}</td><td>${d.sportName}</td><td>${d.year}</td>
        </tr>
      `).join('');
    } else {
      tableHeaders = '<th>#</th><th>Record Details</th><th>Status</th>';
      tableRows = data.map((d, i) => `<tr><td>${i + 1}</td><td>${JSON.stringify(d).slice(0, 100)}</td><td>Active</td></tr>`).join('');
    }

    container.innerHTML = `
      <div class="glass-card p-4">
        <!-- Official College Header -->
        <div class="text-center border-bottom pb-3 mb-4">
          <h4 class="fw-bold mb-1 text-primary">${college.toUpperCase()}</h4>
          <h6 class="fw-bold text-dark mb-1">${department}</h6>
          <div class="text-secondary small">IDAPPADI, SALEM DISTRICT – 637101, TAMIL NADU</div>
          <hr class="my-2">
          <h5 class="fw-bold text-success mb-1">${reportTitle}</h5>
          <div class="small text-muted">Generated on: ${new Date(generatedAt).toLocaleString('en-IN')} &bull; Total Records: <strong>${count}</strong></div>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered table-sm table-striped">
            <thead>
              <tr class="table-primary">${tableHeaders}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <!-- Official Signatures for Print -->
        <div class="row mt-5 pt-4 border-top">
          <div class="col-4 text-center">
            <div class="small text-muted mb-4">Prepared By</div>
            <strong>Office Assistant</strong>
          </div>
          <div class="col-4 text-center">
            <div class="small text-muted mb-4">Verified By</div>
            <strong>${incharge}</strong><br>
            <small class="text-muted">Physical Directress & Sports Incharge</small>
          </div>
          <div class="col-4 text-center">
            <div class="small text-muted mb-4">Approved By</div>
            <strong>Principal</strong><br>
            <small class="text-muted">GASC, Idappadi</small>
          </div>
        </div>

        <div class="text-end mt-4 no-print">
          <button class="btn btn-sports-primary" onclick="window.print()">
            <i class="bi bi-printer me-1"></i> Print Official Report
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="text-center text-danger py-4">Failed to generate report: ${err.message}</div>`;
  }
}

// 16. Settings
async function loadAdminSettings() {
  try {
    const res = await apiRequest('/settings');
    const s = res.settings;

    document.getElementById('set-college-name').value = s.collegeName || '';
    document.getElementById('set-dept-name').value = s.departmentName || '';
    document.getElementById('set-incharge-name').value = s.sportsInchargeName || '';
    document.getElementById('set-incharge-role').value = s.sportsInchargeRole || '';
    document.getElementById('set-email').value = s.email || '';
    document.getElementById('set-phone').value = s.phone || '';
    document.getElementById('set-address').value = s.address || '';
    document.getElementById('set-office-hours').value = s.officeHours || '';

    // Profile photo preview
    const photo = s.sportsInchargePhoto || s.profilePhoto || currentAdminUser?.profilePhoto || 'images/default-avatar.png';
    const previewEl = document.getElementById('set-preview-photo');
    if (previewEl) previewEl.src = photo;
    const photoUrlInput = document.getElementById('set-photo-url');
    if (photoUrlInput) photoUrlInput.value = photo;
    const badgeEl = document.getElementById('set-photo-badge');
    if (badgeEl) badgeEl.classList.add('d-none');
    selectedAdminPhotoFile = null;
  } catch (err) {
    showToast('Failed to load settings', 'error');
  }
}

function previewAdminPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('Image file size must be less than 10MB.', 'warning', 'File Too Large');
    event.target.value = '';
    return;
  }

  selectedAdminPhotoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewEl = document.getElementById('set-preview-photo');
    if (previewEl) previewEl.src = e.target.result;
    const badgeEl = document.getElementById('set-photo-badge');
    if (badgeEl) {
      badgeEl.classList.remove('d-none');
      badgeEl.innerHTML = '<i class="bi bi-check-circle me-1"></i>New Image Staged (Click Save Settings)';
    }
  };
  reader.readAsDataURL(file);
}

function promptPhotoUrl() {
  const currentUrl = document.getElementById('set-photo-url')?.value || '';
  const newUrl = prompt('Enter public image URL for Sports Incharge photo:', currentUrl.startsWith('http') ? currentUrl : '');
  if (newUrl && newUrl.trim()) {
    selectedAdminPhotoFile = null;
    const fileInput = document.getElementById('set-photo-file');
    if (fileInput) fileInput.value = '';
    const previewEl = document.getElementById('set-preview-photo');
    if (previewEl) previewEl.src = newUrl.trim();
    const photoUrlInput = document.getElementById('set-photo-url');
    if (photoUrlInput) photoUrlInput.value = newUrl.trim();
    const badgeEl = document.getElementById('set-photo-badge');
    if (badgeEl) {
      badgeEl.classList.remove('d-none');
      badgeEl.innerHTML = '<i class="bi bi-link-45deg me-1"></i>URL Staged (Click Save Settings)';
    }
  }
}

function resetAdminPhoto() {
  selectedAdminPhotoFile = null;
  const fileInput = document.getElementById('set-photo-file');
  if (fileInput) fileInput.value = '';
  const previewEl = document.getElementById('set-preview-photo');
  if (previewEl) previewEl.src = 'images/default-avatar.png';
  const photoUrlInput = document.getElementById('set-photo-url');
  if (photoUrlInput) photoUrlInput.value = 'images/default-avatar.png';
  const badgeEl = document.getElementById('set-photo-badge');
  if (badgeEl) {
    badgeEl.classList.remove('d-none');
    badgeEl.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i>Reset Staged (Click Save Settings)';
  }
}

async function saveAdminSettings(event) {
  event.preventDefault();
  const collegeName = document.getElementById('set-college-name').value;
  const departmentName = document.getElementById('set-dept-name').value;
  const sportsInchargeName = document.getElementById('set-incharge-name').value;
  const sportsInchargeRole = document.getElementById('set-incharge-role').value;
  const email = document.getElementById('set-email').value;
  const phone = document.getElementById('set-phone').value;
  const address = document.getElementById('set-address').value;
  const officeHours = document.getElementById('set-office-hours').value;
  const sportsInchargePhoto = document.getElementById('set-photo-url')?.value || '';

  const btn = event.target.querySelector('button[type="submit"]');

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving Settings & Photo...';
    }

    let res;
    const token = localStorage.getItem('gasc_token');

    if (selectedAdminPhotoFile) {
      // Send multipart FormData with file
      const formData = new FormData();
      formData.append('collegeName', collegeName);
      formData.append('departmentName', departmentName);
      formData.append('sportsInchargeName', sportsInchargeName);
      formData.append('sportsInchargeRole', sportsInchargeRole);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('officeHours', officeHours);
      formData.append('profilePhoto', selectedAdminPhotoFile);

      res = await apiRequest('/settings', 'PUT', formData, true);
    } else {
      // Standard JSON update
      res = await apiRequest('/settings', 'PUT', {
        collegeName,
        departmentName,
        sportsInchargeName,
        sportsInchargeRole,
        email,
        phone,
        address,
        officeHours,
        sportsInchargePhoto
      });
    }

    if (res && res.settings) {
      const s = res.settings;
      const updatedPhoto = s.sportsInchargePhoto || s.profilePhoto;

      // Immediately update topbar avatar
      const avatarEl = document.getElementById('admin-header-avatar');
      if (avatarEl && updatedPhoto) avatarEl.src = updatedPhoto;

      // Update preview and clear staging badge
      const previewEl = document.getElementById('set-preview-photo');
      if (previewEl && updatedPhoto) previewEl.src = updatedPhoto;
      const photoUrlInput = document.getElementById('set-photo-url');
      if (photoUrlInput && updatedPhoto) photoUrlInput.value = updatedPhoto;
      const badgeEl = document.getElementById('set-photo-badge');
      if (badgeEl) badgeEl.classList.add('d-none');
      selectedAdminPhotoFile = null;

      // Immediately reflect updated profile name and role in topbar
      const nameEl = document.getElementById('admin-display-name');
      if (nameEl && s.sportsInchargeName) nameEl.innerText = s.sportsInchargeName;

      const roleEl = document.getElementById('admin-display-role');
      if (roleEl && s.sportsInchargeRole) roleEl.innerText = s.sportsInchargeRole;

      const coachInput = document.getElementById('add-sport-coach-input');
      if (coachInput && s.sportsInchargeName) coachInput.value = s.sportsInchargeName;

      // Update current admin user session
      if (currentAdminUser) {
        if (s.sportsInchargeName) currentAdminUser.name = s.sportsInchargeName;
        if (updatedPhoto) currentAdminUser.profilePhoto = updatedPhoto;
        localStorage.setItem('gasc_user', JSON.stringify(currentAdminUser));
      }
    }

    showToast(res.message || 'Sports Department settings and Profile Photo updated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-save me-1"></i> Save Settings';
    }
  }
}

// 13. College Roster & Excel Import
let allRosterCache = [];

async function loadAdminRoster() {
  const tbody = document.getElementById('admin-roster-table') || document.getElementById('roster-table-body');
  if (!tbody) return;

  const search = (document.getElementById('roster-search-input')?.value || '').trim();
  const dept = document.getElementById('roster-filter-dept')?.value || 'All';
  const year = document.getElementById('roster-filter-year')?.value || 'All';
  const status = document.getElementById('roster-filter-status')?.value || 'All';

  let url = '/roster?';
  const params = [];
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (dept && dept !== 'All') params.push(`department=${encodeURIComponent(dept)}`);
  if (year && year !== 'All') params.push(`year=${encodeURIComponent(year)}`);
  if (status && status !== 'All') params.push(`status=${encodeURIComponent(status)}`);
  url += params.join('&');

  try {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-secondary"><span class="spinner-border spinner-border-sm me-2"></span>Loading college roster...</td></tr>';
    const res = await apiRequest(url);
    allRosterCache = res.students || [];

    // Update stats
    const totalEl = document.getElementById('roster-stat-total');
    if (totalEl) totalEl.innerText = res.totalCount || 0;

    const regEl = document.getElementById('roster-stat-registered');
    if (regEl) regEl.innerText = res.registeredCount || 0;

    const pendEl = document.getElementById('roster-stat-pending');
    if (pendEl) pendEl.innerText = res.pendingCount || 0;

    renderRosterTable(allRosterCache);
  } catch (err) {
    console.error('Error loading roster:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger"><i class="bi bi-exclamation-triangle me-1"></i> Failed to load roster: ${err.message}</td></tr>`;
  }
}

function renderRosterTable(students) {
  const tbody = document.getElementById('admin-roster-table') || document.getElementById('roster-table-body');
  if (!tbody) return;

  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5 text-secondary">
          <div class="stat-icon bg-secondary bg-opacity-10 text-secondary mx-auto mb-2" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi bi-file-earmark-spreadsheet"></i>
          </div>
          <div class="fw-bold text-dark">No Students Found in College Roster</div>
          <small class="text-muted">Upload an Excel spreadsheet or click "Add Student Manually" above to populate the student list.</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s, idx) => {
    const statusBadge = s.isRegistered 
      ? '<span class="badge bg-success bg-opacity-15 text-success border border-success border-opacity-50 px-2 py-1"><i class="bi bi-check-circle-fill me-1"></i> Registered Athlete</span>'
      : '<span class="badge bg-warning bg-opacity-15 text-dark border border-warning border-opacity-50 px-2 py-1"><i class="bi bi-clock-history me-1"></i> Not Registered Yet</span>';

    const genderIcon = s.gender === 'Female' 
      ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"><i class="bi bi-gender-female me-1"></i>Female</span>'
      : (s.gender === 'Male' ? '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"><i class="bi bi-gender-male me-1"></i>Male</span>' : '<span class="badge bg-secondary bg-opacity-10 text-secondary">Other</span>');

    const studentId = s.id || s._id;
    return `
      <tr>
        <td class="text-muted small">${idx + 1}</td>
        <td>
          <span class="badge bg-dark bg-opacity-85 font-monospace px-2 py-1 fs-6">${s.registerNumber}</span>
        </td>
        <td>
          <div class="fw-bold text-dark">${s.name}</div>
          <small class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-building me-1"></i>${s.collegeName || 'GASC Idappadi'}</small>
        </td>
        <td>
          <span class="badge badge-glass-primary">${s.department}</span>
        </td>
        <td>
          <div class="fw-semibold text-dark">${s.year}</div>
          <small class="text-muted">Section: ${s.section || 'A'}</small>
        </td>
        <td>${genderIcon}</td>
        <td>${statusBadge}</td>
        <td class="text-center text-nowrap">
          <button type="button" onclick="openEditRosterModal('${studentId}')" class="btn btn-sm btn-primary me-1 px-2 py-1 fw-bold shadow-sm" title="Edit Student">
            <i class="bi bi-pencil-square me-1"></i>Edit
          </button>
          <button type="button" onclick="deleteRosterStudent('${studentId}')" class="btn btn-sm btn-danger px-2 py-1 fw-bold shadow-sm" title="Delete Student from Roster">
            <i class="bi bi-trash3-fill me-1"></i>Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleRosterExcelUpload(event) {
  event.preventDefault();
  const fileInput = document.getElementById('roster-excel-file-input') || document.getElementById('roster-file-input');
  const btn = document.getElementById('btn-roster-upload-submit') || document.getElementById('btn-upload-roster');

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    showToast('Please select an Excel (.xlsx, .xls) or CSV file first.', 'warning', 'File Required');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Importing Spreadsheet Rows...';
    }

    const res = await apiRequest('/roster/upload', 'POST', formData, true);
    showToast(res.message, 'success', 'Excel Roster Uploaded');

    fileInput.value = '';
    await loadAdminRoster();
  } catch (err) {
    showToast(err.message || 'Failed to parse and import Excel file.', 'error', 'Upload Failed');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-upload me-1"></i> Upload & Import to Roster';
    }
  }
}

async function submitManualStudentAdd(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    registerNumber: formData.get('registerNumber'),
    name: formData.get('name'),
    department: formData.get('department'),
    year: formData.get('year'),
    section: formData.get('section'),
    gender: formData.get('gender')
  };

  try {
    const res = await apiRequest('/roster/manual', 'POST', payload);
    showToast(res.message, 'success', 'Student Added to Roster');

    const modalEl = document.getElementById('manualAddStudentModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
    form.reset();

    await loadAdminRoster();
  } catch (err) {
    showToast(err.message, 'error', 'Failed to Add Student');
  }
}

async function deleteRosterStudent(id, name, regNo) {
  const student = allRosterCache.find(s => (s.id === id || s._id === id));
  const studentName = name || (student ? student.name : 'this student');
  const studentRegNo = regNo || (student ? student.registerNumber : '');

  if (!confirm(`Are you sure you want to remove "${studentName}" (${studentRegNo}) from the official college roster?\n\nNOTE: If removed, this student will NOT be able to register on the sports portal.`)) {
    return;
  }

  try {
    const res = await apiRequest(`/roster/${id}`, 'DELETE');
    showToast(res.message || 'Student removed from roster.', 'info', 'Removed from Roster');
    await loadAdminRoster();
  } catch (err) {
    showToast(err.message, 'error', 'Delete Failed');
  }
}

function openEditRosterModal(id) {
  const student = allRosterCache.find(s => (s.id === id || s._id === id));
  if (!student) {
    showToast('Student record not found in roster cache.', 'warning', 'Roster');
    return;
  }

  document.getElementById('edit-roster-id').value = id;
  document.getElementById('edit-roster-regno').value = student.registerNumber || '';
  document.getElementById('edit-roster-name').value = student.name || '';
  document.getElementById('edit-roster-dept').value = student.department || 'Computer Science';
  document.getElementById('edit-roster-year').value = student.year || 'I Year';
  document.getElementById('edit-roster-section').value = student.section || 'A';
  document.getElementById('edit-roster-gender').value = student.gender || 'Male';

  const modalEl = document.getElementById('editRosterStudentModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

async function submitEditRosterStudent(event) {
  event.preventDefault();
  const id = document.getElementById('edit-roster-id').value;
  const btn = document.getElementById('btn-save-edit-roster');

  const payload = {
    registerNumber: document.getElementById('edit-roster-regno').value.trim().toUpperCase(),
    name: document.getElementById('edit-roster-name').value.trim(),
    department: document.getElementById('edit-roster-dept').value,
    year: document.getElementById('edit-roster-year').value,
    section: document.getElementById('edit-roster-section').value.trim().toUpperCase() || 'A',
    gender: document.getElementById('edit-roster-gender').value
  };

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
    }

    const res = await apiRequest(`/roster/${id}`, 'PUT', payload);
    showToast(res.message || 'Student updated successfully!', 'success', 'Roster Updated');

    const modalEl = document.getElementById('editRosterStudentModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    await loadAdminRoster();
  } catch (err) {
    showToast(err.message || 'Failed to update student.', 'error', 'Update Failed');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save Changes';
    }
  }
}

async function downloadRosterTemplate() {
  const token = localStorage.getItem('gasc_token');
  try {
    showToast('Generating official Excel roster template...', 'info', 'Download');
    const templateUrl = (window.GASC_CONFIG && window.GASC_CONFIG.getApiUrl)
      ? window.GASC_CONFIG.getApiUrl('/roster/template')
      : '/api/roster/template';
    const response = await fetch(templateUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download template.');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'gasc_idappadi_students_roster_template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

    showToast('Template downloaded! Fill in student rows and upload anytime.', 'success', 'Downloaded');
  } catch (err) {
    console.error('Download error:', err);
    showToast('Failed to download Excel template: ' + err.message, 'error', 'Download Error');
  }
}

// ============================================================
// MODULE 17: EXTERNAL SPORTS COMPETITIONS (Admin)
// ============================================================

const EC_DEADLINE_COLORS = {
  'Registration Open':         { badge: 'bg-success',        icon: '🟢' },
  'Registration Closing Soon': { badge: 'bg-warning text-dark', icon: '🟠' },
  'Registration Closed':       { badge: 'bg-danger',         icon: '🔴' },
  'Completed':                 { badge: 'bg-secondary',      icon: '⚫' }
};

function getDeadlineStatusBadge(ds) {
  const info = EC_DEADLINE_COLORS[ds] || { badge: 'bg-info', icon: '🔵' };
  return `<span class="badge ${info.badge}">${info.icon} ${ds || 'Unknown'}</span>`;
}

async function loadAdminExternalCompetitions() {
  const tbody = document.getElementById('ec-admin-table');
  if (!tbody) return;

  const search = (document.getElementById('ec-search')?.value || '').trim();
  const level  = document.getElementById('ec-filter-level')?.value || 'All';
  const status = document.getElementById('ec-filter-status')?.value || 'All';

  let url = '/external-competitions?';
  if (search)          url += `search=${encodeURIComponent(search)}&`;
  if (level  !== 'All') url += `level=${encodeURIComponent(level)}&`;
  if (status !== 'All') url += `status=${encodeURIComponent(status)}&`;

  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading competitions...</td></tr>';

  try {
    const res   = await apiRequest(url);
    const comps = res.competitions || [];

    const el = id => document.getElementById(id);
    if (el('ec-stat-total'))     el('ec-stat-total').textContent     = comps.length;
    if (el('ec-stat-open'))      el('ec-stat-open').textContent      = comps.filter(c => c.deadlineStatus === 'Registration Open').length;
    if (el('ec-stat-closing'))   el('ec-stat-closing').textContent   = comps.filter(c => c.deadlineStatus === 'Registration Closing Soon').length;
    if (el('ec-stat-completed')) el('ec-stat-completed').textContent = comps.filter(c => c.status === 'Completed').length;

    if (!comps.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">
        <i class="bi bi-globe2 fs-2 d-block mb-2 text-primary opacity-50"></i>
        No external competitions found.<br><small>Click "Add Competition" to create the first one.</small>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = comps.map((c, i) => {
      const deadline    = c.registrationDeadline ? new Date(c.registrationDeadline).toLocaleDateString('en-IN') : '—';
      const isPublished = ['Published','Registration Open'].includes(c.status);
      const statusCls   = isPublished ? 'bg-success' : c.status === 'Draft' ? 'bg-secondary' : c.status === 'Registration Closed' ? 'bg-danger' : 'bg-warning text-dark';
      return `<tr>
        <td class="text-muted small">${i + 1}</td>
        <td>
          <div class="fw-semibold text-dark">${c.title}</div>
          <small class="text-muted">${c.organizer || '—'}${c.venue ? ' · ' + c.venue : ''}</small>
        </td>
        <td>
          <span class="badge bg-primary bg-opacity-10 text-primary me-1">${c.sport || 'General'}</span>
          <small class="text-secondary d-block mt-1">${c.level || '—'}</small>
        </td>
        <td>
          <small class="fw-semibold d-block">${deadline}</small>
          ${getDeadlineStatusBadge(c.deadlineStatus)}
        </td>
        <td><span class="badge ${statusCls}">${c.status}</span></td>
        <td class="text-center">${c.featured ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>'}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success" onclick="toggleECPublish('${c._id}')" title="${isPublished ? 'Unpublish' : 'Publish'}">
              <i class="bi bi-${isPublished ? 'eye-slash' : 'eye'}"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteExternalComp('${c._id}','${c.title.replace(/'/g,"\\'")}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</td></tr>`;
  }
}

async function submitAddExternalComp(event) {
  event.preventDefault();
  const btn = document.getElementById('ec-submit-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...'; }

  const payload = {
    title:                (document.getElementById('ec-title')?.value || '').trim(),
    sport:                (document.getElementById('ec-sport')?.value || 'General').trim(),
    level:                document.getElementById('ec-level')?.value || 'Inter-College',
    type:                 document.getElementById('ec-type')?.value || 'Individual',
    gender:               document.getElementById('ec-gender')?.value || 'All',
    organizer:            (document.getElementById('ec-organizer')?.value || '').trim(),
    venue:                (document.getElementById('ec-venue')?.value || '').trim(),
    startDate:            document.getElementById('ec-start-date')?.value || null,
    endDate:              document.getElementById('ec-end-date')?.value || null,
    registrationDeadline: document.getElementById('ec-reg-deadline')?.value,
    eligibility:          (document.getElementById('ec-eligibility')?.value || '').trim(),
    description:          (document.getElementById('ec-description')?.value || '').trim(),
    announcementSummary:  (document.getElementById('ec-summary')?.value || '').trim(),
    sourceName:           (document.getElementById('ec-source-name')?.value || '').trim(),
    sourceUrl:            (document.getElementById('ec-source-url')?.value || '').trim(),
    registrationUrl:      (document.getElementById('ec-reg-url')?.value || '').trim(),
    image:                (document.getElementById('ec-image')?.value || '').trim(),
    status:               document.getElementById('ec-status')?.value || 'Draft',
    featured:             document.getElementById('ec-featured')?.checked || false
  };

  try {
    const res = await apiRequest('/external-competitions', 'POST', payload);
    showToast(res.message || 'Competition added successfully!', 'success', '🌐 Competition Created');
    const modalEl = document.getElementById('addExternalCompModal');
    if (modalEl) { const m = bootstrap.Modal.getInstance(modalEl); if (m) m.hide(); }
    event.target.reset();
    await loadAdminExternalCompetitions();
  } catch (err) {
    showToast(err.message, 'error', 'Failed to Save');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Save Competition'; }
  }
}

async function toggleECPublish(id) {
  try {
    const res = await apiRequest(`/external-competitions/${id}/publish`, 'PATCH', {});
    showToast(res.message, 'success', 'Status Updated');
    await loadAdminExternalCompetitions();
  } catch (err) {
    showToast(err.message, 'error', 'Update Failed');
  }
}

async function deleteExternalComp(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  try {
    const res = await apiRequest(`/external-competitions/${id}`, 'DELETE');
    showToast(res.message, 'info', '🗑️ Deleted');
    await loadAdminExternalCompetitions();
  } catch (err) {
    showToast(err.message, 'error', 'Delete Failed');
  }
}

// ============================================================
// MODULE 18: SPORTS NEWS & ANNOUNCEMENTS (Admin)
// ============================================================

async function loadAdminSportsNews() {
  const tbody = document.getElementById('sn-admin-table');
  if (!tbody) return;

  const search   = (document.getElementById('sn-search')?.value || '').trim();
  const category = document.getElementById('sn-filter-category')?.value || 'All';
  const status   = document.getElementById('sn-filter-status')?.value || 'All';

  let url = '/sports-news?';
  if (search)            url += `search=${encodeURIComponent(search)}&`;
  if (category !== 'All') url += `category=${encodeURIComponent(category)}&`;
  if (status   !== 'All') url += `status=${encodeURIComponent(status)}&`;

  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading news...</td></tr>';

  try {
    const res  = await apiRequest(url);
    const news = res.news || [];

    const el = id => document.getElementById(id);
    if (el('sn-stat-total'))     el('sn-stat-total').textContent     = news.length;
    if (el('sn-stat-published')) el('sn-stat-published').textContent = news.filter(n => n.status === 'Published').length;
    if (el('sn-stat-featured'))  el('sn-stat-featured').textContent  = news.filter(n => n.featured).length;
    if (el('sn-stat-draft'))     el('sn-stat-draft').textContent     = news.filter(n => n.status === 'Draft').length;

    if (!news.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">
        <i class="bi bi-newspaper fs-2 d-block mb-2 text-primary opacity-50"></i>
        No sports news found.<br><small>Click "Add News" to create the first announcement.</small>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = news.map((n, i) => {
      const pubDate    = n.publishedDate ? new Date(n.publishedDate).toLocaleDateString('en-IN') : '—';
      const statusCls  = n.status === 'Published' ? 'bg-success' : n.status === 'Archived' ? 'bg-secondary' : 'bg-warning text-dark';
      return `<tr>
        <td class="text-muted small">${i + 1}</td>
        <td>
          <div class="fw-semibold text-dark" style="max-width:280px;">${n.title}</div>
          <small class="text-muted text-truncate d-block" style="max-width:280px;">${n.shortSummary || ''}</small>
        </td>
        <td>
          <span class="badge bg-info bg-opacity-15 text-info border border-info border-opacity-25 small">${n.category || 'General'}</span>
          <small class="text-muted d-block mt-1">${n.sport || 'General'}</small>
        </td>
        <td><small class="fw-semibold">${pubDate}</small></td>
        <td><span class="badge ${statusCls}">${n.status}</span></td>
        <td class="text-center">${n.featured ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>'}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success" onclick="toggleSNPublish('${n._id}')" title="${n.status === 'Published' ? 'Unpublish' : 'Publish'}">
              <i class="bi bi-${n.status === 'Published' ? 'eye-slash' : 'eye'}"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="deleteSportsNews('${n._id}','${n.title.replace(/'/g,"\\'")}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</td></tr>`;
  }
}

async function submitAddSportsNews(event) {
  event.preventDefault();
  const btn = document.getElementById('sn-submit-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...'; }

  const today = new Date().toISOString().split('T')[0];
  const payload = {
    title:           (document.getElementById('sn-title')?.value || '').trim(),
    shortSummary:    (document.getElementById('sn-summary')?.value || '').trim(),
    fullDescription: (document.getElementById('sn-description')?.value || '').trim(),
    sport:           (document.getElementById('sn-sport')?.value || 'General').trim(),
    category:        document.getElementById('sn-category')?.value || 'General Sports News',
    sourceName:      (document.getElementById('sn-source-name')?.value || '').trim(),
    sourceUrl:       (document.getElementById('sn-source-url')?.value || '').trim(),
    publishedDate:   document.getElementById('sn-published-date')?.value || today,
    image:           (document.getElementById('sn-image')?.value || '').trim(),
    status:          document.getElementById('sn-status')?.value || 'Draft',
    featured:        document.getElementById('sn-featured')?.checked || false
  };

  try {
    const res = await apiRequest('/sports-news', 'POST', payload);
    showToast(res.message || 'News published!', 'success', '📰 News Created');
    const modalEl = document.getElementById('addSportsNewsModal');
    if (modalEl) { const m = bootstrap.Modal.getInstance(modalEl); if (m) m.hide(); }
    event.target.reset();
    await loadAdminSportsNews();
  } catch (err) {
    showToast(err.message, 'error', 'Failed to Save');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Save News'; }
  }
}

async function toggleSNPublish(id) {
  try {
    const res = await apiRequest(`/sports-news/${id}/publish`, 'PATCH', {});
    showToast(res.message, 'success', 'Status Updated');
    await loadAdminSportsNews();
  } catch (err) {
    showToast(err.message, 'error', 'Update Failed');
  }
}

async function deleteSportsNews(id, title) {
  if (!confirm(`Delete news "${title}"? This cannot be undone.`)) return;
  try {
    const res = await apiRequest(`/sports-news/${id}`, 'DELETE');
    showToast(res.message, 'info', '🗑️ Deleted');
    await loadAdminSportsNews();
  } catch (err) {
    showToast(err.message, 'error', 'Delete Failed');
  }
}

// Global window mappings for Roster actions
window.openEditRosterModal = openEditRosterModal;
window.deleteRosterStudent = deleteRosterStudent;
window.submitEditRosterStudent = submitEditRosterStudent;
window.loadAdminRoster = loadAdminRoster;

