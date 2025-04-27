import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setFileData(json);
    };
    reader.readAsBinaryString(file);
  };

  const resetFile = () => {
    setSelectedFile(null);
    setFileData([]);
  };

  return {
    selectedFile,
    fileData,
    handleFileChange,
    resetFile,
  };
}