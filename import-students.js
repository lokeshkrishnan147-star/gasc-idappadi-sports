/**
 * GASC Idappadi Sports - Bulk Student Importer from Excel / CSV
 * 
 * Usage:
 *   node import-students.js                  (Imports from 'students.xlsx' or 'students.csv' in project root)
 *   node import-students.js my_file.xlsx     (Imports from custom file path)
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const connectDB = require('./server/config/db');
const CollegeStudentRoster = require('./server/models/CollegeStudentRoster');

function normalizeKeys(row) {
  const normalized = {};
  for (const key of Object.keys(row)) {
    const cleanKey = key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    normalized[cleanKey] = row[key];
  }
  return normalized;
}

function extractStudent(row) {
  const norm = normalizeKeys(row);

  const regNo = norm['registerno'] || norm['registernumber'] || norm['regno'] || norm['rollno'] || norm['rollnumber'] || norm['register'] || norm['reg'] || '';
  const name = norm['studentname'] || norm['name'] || norm['candidatename'] || norm['fullname'] || norm['student'] || '';

  let dept = norm['department'] || norm['dept'] || norm['branch'] || norm['course'] || 'Computer Science';
  dept = dept.toString().trim();
  if (/^cs|comp|b\.?sc\s*cs/i.test(dept)) dept = 'Computer Science';
  else if (/^com|b\.?com/i.test(dept)) dept = 'Commerce';
  else if (/^math|b\.?sc\s*math/i.test(dept)) dept = 'Mathematics';
  else if (/^eng|b\.?a\s*eng/i.test(dept)) dept = 'English';
  else if (/^tam|b\.?a\s*tam/i.test(dept)) dept = 'Tamil';
  else if (/^phy|b\.?sc\s*phy/i.test(dept)) dept = 'Physics';
  else if (/^chem|b\.?sc\s*chem/i.test(dept)) dept = 'Chemistry';
  else if (/^bba/i.test(dept)) dept = 'BBA';
  else if (/^eco|b\.?a\s*eco/i.test(dept)) dept = 'Economics';

  let year = norm['year'] || norm['yearofstudy'] || norm['batch'] || norm['currentyear'] || 'I Year';
  year = year.toString().trim();
  if (/^1|first|i(?!\w)/i.test(year)) year = 'I Year';
  else if (/^2|second|ii(?!\w)/i.test(year)) year = 'II Year';
  else if (/^3|third|iii(?!\w)/i.test(year)) year = 'III Year';

  let section = norm['section'] || norm['sec'] || 'A';
  section = section.toString().trim().toUpperCase().substring(0, 5) || 'A';

  let gender = norm['gender'] || norm['sex'] || 'Male';
  gender = gender.toString().trim();
  if (/^f/i.test(gender)) gender = 'Female';
  else if (/^m/i.test(gender)) gender = 'Male';
  else gender = 'Other';

  if (!regNo || !name) return null;

  return {
    registerNumber: regNo.toString().trim().toUpperCase(),
    name: name.toString().trim(),
    department: dept,
    year,
    section,
    gender
  };
}

const runImport = async () => {
  try {
    console.log('\n===============================================================');
    console.log('🏛️ GASC IDAPPADI — EXCEL / CSV STUDENT ROSTER IMPORTER');
    console.log('===============================================================');

    let targetFile = process.argv[2];
    if (!targetFile) {
      // Look for default file in root
      if (fs.existsSync('students.xlsx')) targetFile = 'students.xlsx';
      else if (fs.existsSync('students.xls')) targetFile = 'students.xls';
      else if (fs.existsSync('students.csv')) targetFile = 'students.csv';
      else {
        console.error('\n❌ No Excel file specified or found!');
        console.log('\nHow to use:');
        console.log('  1. Place your excel file in this folder and name it "students.xlsx"');
        console.log('  2. Run: node import-students.js');
        console.log('     OR specify your file name: node import-students.js my_college_students.xlsx\n');
        process.exit(1);
      }
    }

    const resolvedPath = path.resolve(targetFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`\n❌ File not found at: ${resolvedPath}\n`);
      process.exit(1);
    }

    console.log(`📂 Reading file: ${resolvedPath}`);
    const workbook = xlsx.readFile(resolvedPath);
    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    console.log(`📊 Found sheet "${sheetName}" with ${rawRows.length} rows.`);

    await connectDB();

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rawRows) {
      const student = extractStudent(row);
      if (!student || !student.registerNumber) {
        skipped++;
        continue;
      }

      const existing = await CollegeStudentRoster.findOne({ registerNumber: student.registerNumber });
      if (existing) {
        existing.name = student.name;
        existing.department = student.department;
        existing.year = student.year;
        existing.section = student.section;
        existing.gender = student.gender;
        await existing.save();
        updated++;
      } else {
        await CollegeStudentRoster.create(student);
        inserted++;
      }
    }

    const totalInRoster = await CollegeStudentRoster.countDocuments();

    console.log('\n---------------------------------------------------------------');
    console.log('✅ IMPORT SUCCESSFUL!');
    console.log(`   ➕ New Students Added:     ${inserted}`);
    console.log(`   🔄 Existing Records Updated: ${updated}`);
    console.log(`   ⏭️ Skipped Empty Rows:     ${skipped}`);
    console.log(`   👥 Total College Students:   ${totalInRoster}`);
    console.log('---------------------------------------------------------------');
    console.log('Now only these bonafide students can register on the portal!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
};

runImport();
