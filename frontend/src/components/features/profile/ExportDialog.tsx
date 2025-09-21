'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/types';
import { DataExporter } from '@/lib/utils/exportUtils';
import { toast } from 'sonner';

interface ExportDialogProps {
  trigger?: React.ReactNode;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('Excel');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [sections, setSections] = useState({
    basicInfo: true,
    healthRecords: true,
    breedingRecords: true,
    vaccinations: true
  });
  const [includeImages, setIncludeImages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get data from Redux store
  const animals = useSelector((state: RootState) => state.animals.animals);
  const breedingRecords = useSelector((state: RootState) => state.breeding.breedingRecords);

  // Mock data for vaccination and health records (these would come from Redux in a complete implementation)
  const vaccinationRecords: any[] = [];
  const healthRecords: any[] = [];

  const exportFormats = [
    {
      format: 'Excel' as const,
      icon: FileSpreadsheet,
      title: 'Excel Spreadsheet',
      description: 'Comprehensive data in multiple sheets',
      extension: '.xlsx'
    },
    {
      format: 'PDF' as const,
      icon: FileText,
      title: 'PDF Report',
      description: 'Professional formatted report',
      extension: '.pdf'
    },
    {
      format: 'CSV' as const,
      icon: File,
      title: 'CSV File',
      description: 'Simple comma-separated values',
      extension: '.csv'
    }
  ];

  const filteredAnimals = animals.filter(animal => {
    const animalDate = new Date(animal.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include end of day
    
    return animalDate >= startDate && animalDate <= endDate;
  });

  const exportStats = DataExporter.getExportStats(
    filteredAnimals,
    breedingRecords,
    vaccinationRecords,
    healthRecords
  );

  const handleExport = async () => {
    if (filteredAnimals.length === 0) {
      toast.error('No animals found in the selected date range');
      return;
    }

    setIsExporting(true);

    try {
      const exportOptions = {
        format: selectedFormat,
        dateRange: {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        },
        includeImages,
        animals: filteredAnimals.map(a => a.id),
        sections
      };

      switch (selectedFormat) {
        case 'Excel':
          DataExporter.exportToExcel(
            filteredAnimals,
            breedingRecords,
            vaccinationRecords,
            healthRecords,
            exportOptions
          );
          break;
        case 'PDF':
          DataExporter.exportToPDF(
            filteredAnimals,
            breedingRecords,
            vaccinationRecords,
            healthRecords,
            exportOptions
          );
          break;
        case 'CSV':
          DataExporter.exportToCSV(filteredAnimals, exportOptions);
          break;
      }

      toast.success(`Data exported successfully as ${selectedFormat}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Animal Records</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <Card 
                    key={format.format}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.format 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFormat(format.format)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Icon className="w-8 h-8 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{format.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format.description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {format.extension}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Sections to Include */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sections to Include</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basic-info"
                  checked={sections.basicInfo}
                  onCheckedChange={(checked) => 
                    setSections(prev => ({ ...prev, basicInfo: checked as boolean }))
                  }
                />
                <Label htmlFor="basic-info" className="text-sm">Basic Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="health-records"
                  checked={sections.healthRecords}
                  onCheckedChange={(checked) => 
                    setSections(prev => ({ ...prev, healthRecords: checked as boolean }))
                  }
                />
                <Label htmlFor="health-records" className="text-sm">Health Records</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breeding-records"
                  checked={sections.breedingRecords}
                  onCheckedChange={(checked) => 
                    setSections(prev => ({ ...prev, breedingRecords: checked as boolean }))
                  }
                />
                <Label htmlFor="breeding-records" className="text-sm">Breeding Records</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccinations"
                  checked={sections.vaccinations}
                  onCheckedChange={(checked) => 
                    setSections(prev => ({ ...prev, vaccinations: checked as boolean }))
                  }
                />
                <Label htmlFor="vaccinations" className="text-sm">Vaccinations</Label>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-images"
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                disabled={selectedFormat === 'CSV'} // Images not supported in CSV
              />
              <Label 
                htmlFor="include-images" 
                className={`text-sm ${selectedFormat === 'CSV' ? 'text-muted-foreground' : ''}`}
              >
                Include Animal Images {selectedFormat === 'CSV' && '(Not available for CSV)'}
              </Label>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Export Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-primary">{exportStats.totalAnimals}</div>
                  <div className="text-muted-foreground">Total Animals</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{exportStats.cattleCount}</div>
                  <div className="text-muted-foreground">Cattle</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-600">{exportStats.buffaloCount}</div>
                  <div className="text-muted-foreground">Buffalo</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">{exportStats.pregnantAnimals}</div>
                  <div className="text-muted-foreground">Pregnant</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || filteredAnimals.length === 0}
            >
              {isExporting ? 'Exporting...' : `Export ${selectedFormat}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};