'use client';

import { useState } from 'react';
import { Download, FileText, Database, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ExportPage() {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const dataTypes = [
    {
      id: 'animals',
      label: 'Animal Profiles',
      description: 'Basic information, breed, age, gender',
      count: 15,
      icon: Database,
    },
    {
      id: 'breeding',
      label: 'Breeding Records',
      description: 'Mating dates, pregnancy status, offspring',
      count: 8,
      icon: Calendar,
    },
    {
      id: 'health',
      label: 'Health Records',
      description: 'Vaccinations, treatments, checkups',
      count: 23,
      icon: CheckCircle,
    },
    {
      id: 'feeding',
      label: 'Feeding Logs',
      description: 'Feed types, schedules, consumption',
      count: 45,
      icon: FileText,
    },
  ];

  const formats = [
    { value: 'csv', label: 'CSV (Excel Compatible)', description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'pdf', label: 'PDF Report', description: 'Formatted document' },
    { value: 'xlsx', label: 'Excel File', description: 'Microsoft Excel format' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleDataTypeChange = (dataTypeId: string, checked: boolean) => {
    setSelectedData(prev => 
      checked 
        ? [...prev, dataTypeId]
        : prev.filter(id => id !== dataTypeId)
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Export completed successfully! File will be downloaded shortly.');
      
      // In a real app, this would trigger the actual file download
      // For demo, we'll just show success
      
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectAll = () => {
    setSelectedData(dataTypes.map(type => type.id));
  };

  const clearAll = () => {
    setSelectedData([]);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-green-700">Export Data</h1>
          <p className="text-gray-600 mt-2">Export your farm data in various formats</p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <Database className="w-3 h-3 mr-1" />
          {selectedData.length} selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <div className="space-y-6">
          {/* Data Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Data Types</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataTypes.map((dataType) => {
                const Icon = dataType.icon;
                return (
                  <div key={dataType.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedData.includes(dataType.id)}
                      onCheckedChange={(checked) => handleDataTypeChange(dataType.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <Label className="font-medium">{dataType.label}</Label>
                        <Badge variant="secondary" className="text-xs">
                          {dataType.count} records
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{dataType.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formats.map((formatOption) => (
                <div key={formatOption.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="radio"
                    name="format"
                    value={formatOption.value}
                    checked={format === formatOption.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label className="font-medium">{formatOption.label}</Label>
                    <p className="text-sm text-gray-600 mt-1">{formatOption.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Types:</span>
                  <span className="font-medium">{selectedData.length} selected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{formats.find(f => f.value === format)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">{dateRanges.find(r => r.value === dateRange)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">
                    {selectedData.reduce((total, id) => {
                      const dataType = dataTypes.find(dt => dt.id === id);
                      return total + (dataType?.count || 0);
                    }, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleExport}
                disabled={selectedData.length === 0 || isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center text-gray-500 py-4">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent exports</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}