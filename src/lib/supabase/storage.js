import { supabase } from './client';

export const storage = {
  // Upload CSV file
  async uploadCSV(organizationId, file) {
    const fileName = `${organizationId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('imports')
      .upload(fileName, file);
    
    if (error) throw error;
    return data;
  },

  // Upload recording
  async uploadRecording(organizationId, callId, file) {
    const fileName = `${organizationId}/recordings/${callId}.webm`;
    
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Get file URL
  getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Delete file
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }

export default {
  supabase,
  auth,
  db,
  realtime,
  storage
};