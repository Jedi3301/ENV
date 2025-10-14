import { supabase } from './supabaseClient';

// ========== Weather Data ==========
export const getLatestWeatherData = async () => {
  try {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getWeatherHistory = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const subscribeToWeatherData = (callback) => {
  return supabase
    .channel('weather_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'weather_data' }, 
      callback
    )
    .subscribe();
};

// ========== Air Quality Data ==========
export const getLatestAirQualityData = async () => {
  try {
    const { data, error } = await supabase
      .from('air_quality_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getAirQualityHistory = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('air_quality_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const subscribeToAirQualityData = (callback) => {
  return supabase
    .channel('air_quality_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'air_quality_data' }, 
      callback
    )
    .subscribe();
};

// ========== Water Quality Data ==========
export const getLatestWaterQualityData = async () => {
  try {
    const { data, error } = await supabase
      .from('water_quality_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getWaterQualityHistory = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('water_quality_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const subscribeToWaterQualityData = (callback) => {
  return supabase
    .channel('water_quality_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'water_quality_data' }, 
      callback
    )
    .subscribe();
};

// ========== Admin Functions ==========

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Delete weather data (admin only)
export const deleteWeatherData = async (id) => {
  try {
    const { error } = await supabase
      .from('weather_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Update weather data (admin only)
export const updateWeatherData = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('weather_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Delete air quality data (admin only)
export const deleteAirQualityData = async (id) => {
  try {
    const { error } = await supabase
      .from('air_quality_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Update air quality data (admin only)
export const updateAirQualityData = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('air_quality_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Delete water quality data (admin only)
export const deleteWaterQualityData = async (id) => {
  try {
    const { error } = await supabase
      .from('water_quality_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Update water quality data (admin only)
export const updateWaterQualityData = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('water_quality_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Insert new data (for testing or manual entry)
export const insertWeatherData = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('weather_data')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const insertAirQualityData = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('air_quality_data')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const insertWaterQualityData = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('water_quality_data')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
