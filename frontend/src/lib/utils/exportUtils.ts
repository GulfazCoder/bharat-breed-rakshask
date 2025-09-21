import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Animal, BreedingRecord, VaccinationRecord, HealthRecord, ExportOptions } from '@/lib/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class DataExporter {
  
  /**
   * Export animal data to Excel format
   */
  static exportToExcel(
    animals: Animal[], 
    breedingRecords: BreedingRecord[] = [],
    vaccinationRecords: VaccinationRecord[] = [],
    healthRecords: HealthRecord[] = [],
    options: ExportOptions
  ): void {
    const workbook = XLSX.utils.book_new();

    // Basic animal information
    if (options.sections.basicInfo) {
      const animalData = animals.map(animal => ({
        'Name': animal.name,
        'Breed ID': animal.breedId,
        'Category': animal.category,
        'Gender': animal.gender,
        'Birth Date': new Date(animal.birthDate).toLocaleDateString(),
        'Age': animal.age,
        'Height (cm)': animal.height,
        'Weight (kg)': animal.weight,
        'Pregnant': animal.isPregnant ? 'Yes' : 'No',
        'Health Status': animal.healthStatus,
        'Last Vaccination': animal.lastVaccination ? new Date(animal.lastVaccination).toLocaleDateString() : 'N/A',
        'Notes': animal.notes || 'N/A'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(animalData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Animals');
    }

    // Breeding records
    if (options.sections.breedingRecords && breedingRecords.length > 0) {
      const breedingData = breedingRecords.map(record => ({
        'Animal ID': record.animalId,
        'Mating Date': new Date(record.matingDate).toLocaleDateString(),
        'Expected Due Date': new Date(record.expectedDueDate).toLocaleDateString(),
        'Actual Due Date': record.actualDueDate ? new Date(record.actualDueDate).toLocaleDateString() : 'N/A',
        'Mate ID': record.mateId || 'N/A',
        'Breeding Method': record.breedingMethod,
        'Pregnancy Status': record.pregnancyStatus,
        'Offspring Count': record.offspringCount || 0,
        'Notes': record.notes || 'N/A'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(breedingData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Breeding Records');
    }

    // Vaccination records
    if (options.sections.vaccinations && vaccinationRecords.length > 0) {
      const vaccinationData = vaccinationRecords.map(record => ({
        'Animal ID': record.animalId,
        'Vaccine Name': record.vaccineName,
        'Vaccine Type': record.vaccineType,
        'Administered Date': new Date(record.administeredDate).toLocaleDateString(),
        'Next Due Date': new Date(record.nextDueDate).toLocaleDateString(),
        'Veterinarian ID': record.veterinarianId || 'N/A',
        'Batch Number': record.batchNumber || 'N/A',
        'Notes': record.notes || 'N/A'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(vaccinationData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaccinations');
    }

    // Health records
    if (options.sections.healthRecords && healthRecords.length > 0) {
      const healthData = healthRecords.map(record => ({
        'Animal ID': record.animalId,
        'Record Type': record.recordType,
        'Description': record.description,
        'Symptoms': record.symptoms?.join(', ') || 'N/A',
        'Diagnosis': record.diagnosis || 'N/A',
        'Treatment': record.treatment || 'N/A',
        'Medications': record.medications?.join(', ') || 'N/A',
        'Record Date': new Date(record.recordDate).toLocaleDateString(),
        'Follow-up Date': record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'N/A',
        'Resolved': record.resolved ? 'Yes' : 'No'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(healthData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Health Records');
    }

    // Export file
    const fileName = `bharat-breed-rakshask-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export animal data to PDF format
   */
  static exportToPDF(
    animals: Animal[], 
    breedingRecords: BreedingRecord[] = [],
    vaccinationRecords: VaccinationRecord[] = [],
    healthRecords: HealthRecord[] = [],
    options: ExportOptions
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Bharat Breed Rakshask - Export Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;

    doc.text(`Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Basic animal information
    if (options.sections.basicInfo && animals.length > 0) {
      doc.setFontSize(16);
      doc.text('Animal Information', 20, yPosition);
      yPosition += 10;

      const animalTableData = animals.map(animal => [
        animal.name,
        animal.category,
        animal.gender,
        animal.age.toString(),
        `${animal.weight} kg`,
        animal.healthStatus,
        animal.isPregnant ? 'Yes' : 'No'
      ]);

      doc.autoTable({
        head: [['Name', 'Category', 'Gender', 'Age', 'Weight', 'Health Status', 'Pregnant']],
        body: animalTableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Breeding records
    if (options.sections.breedingRecords && breedingRecords.length > 0) {
      doc.setFontSize(16);
      doc.text('Breeding Records', 20, yPosition);
      yPosition += 10;

      const breedingTableData = breedingRecords.map(record => [
        record.animalId,
        new Date(record.matingDate).toLocaleDateString(),
        new Date(record.expectedDueDate).toLocaleDateString(),
        record.breedingMethod,
        record.pregnancyStatus
      ]);

      doc.autoTable({
        head: [['Animal ID', 'Mating Date', 'Due Date', 'Method', 'Status']],
        body: breedingTableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [234, 179, 8] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Save PDF
    const fileName = `bharat-breed-rakshask-export-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Export animal data to CSV format
   */
  static exportToCSV(
    animals: Animal[],
    options: ExportOptions
  ): void {
    if (!options.sections.basicInfo) return;

    const headers = [
      'Name', 'Breed ID', 'Category', 'Gender', 'Birth Date', 'Age', 
      'Height (cm)', 'Weight (kg)', 'Pregnant', 'Health Status', 
      'Last Vaccination', 'Next Vaccination', 'Notes'
    ];

    const csvData = animals.map(animal => [
      animal.name,
      animal.breedId,
      animal.category,
      animal.gender,
      animal.birthDate.toLocaleDateString(),
      animal.age,
      animal.height,
      animal.weight,
      animal.isPregnant ? 'Yes' : 'No',
      animal.healthStatus,
      animal.lastVaccination?.toLocaleDateString() || 'N/A',
      animal.nextVaccination?.toLocaleDateString() || 'N/A',
      animal.notes || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bharat-breed-rakshask-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get export statistics
   */
  static getExportStats(
    animals: Animal[],
    breedingRecords: BreedingRecord[] = [],
    vaccinationRecords: VaccinationRecord[] = [],
    healthRecords: HealthRecord[] = []
  ) {
    return {
      totalAnimals: animals.length,
      cattleCount: animals.filter(a => a.category === 'Cattle').length,
      buffaloCount: animals.filter(a => a.category === 'Buffalo').length,
      pregnantAnimals: animals.filter(a => a.isPregnant).length,
      healthyAnimals: animals.filter(a => a.healthStatus === 'Healthy').length,
      breedingRecords: breedingRecords.length,
      vaccinationRecords: vaccinationRecords.length,
      healthRecords: healthRecords.length
    };
  }
}