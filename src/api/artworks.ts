import axios from 'axios';

// API response types
export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

export interface ApiResponse {
  data: Array<{
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string | null;
    date_start: number;
    date_end: number;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string | null;
  };
}

export const fetchArtworks = async (page: number, limit: number): Promise<ApiResponse> => {
  const response = await axios.get<ApiResponse>(
    `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`
  );
  return response.data;
};

