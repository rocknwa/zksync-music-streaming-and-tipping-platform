'use client';

import { useState } from 'react';
import axios from 'axios';

interface UseIPFSReturn {
  uploadToIPFS: (file: File, name?: string) => Promise<string>;
  isUploading: boolean;
  error: string | null;
}

export const useIPFS = (): UseIPFSReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = async (file: File, name: string = 'File'): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      let formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: name,
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const res = await axios.post(url, formData, {
        headers: {
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          "Content-Type": "multipart/form-data"
        },
      });

      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (err) {
      setError('Failed to upload file to IPFS');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToIPFS, isUploading, error };
};