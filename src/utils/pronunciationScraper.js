import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes Cambridge Dictionary to get the US pronunciation audio URL for a word
 * @param {string} word - The English word to get pronunciation for
 * @returns {Promise<string|null>} - URL of the audio file or null if not found
 */
export const getUSPronunciationURL = async (word) => {
  try {
    const formattedWord = word.trim().toLowerCase().replace(/\s+/g, '-');
    const url = `https://dictionary.cambridge.org/dictionary/english/${formattedWord}`;
    
    console.log(`Fetching pronunciation for "${word}" from ${url}`);
    
    // Fetch the dictionary page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Find US pronunciation audio
    // Look for elements with 'us dpron-i' class, then find audio source with 'audio/mpeg' type
    let audioUrl = null;
    
    // First try finding the span with 'us dpron-i' class
    $('.us.dpron-i').each((index, element) => {
      // Find the audio element
      const audio = $(element).find('audio.hdn');
      if (audio.length > 0) {
        // Look for the source with type 'audio/mpeg'
        const source = $(audio).find('source[type="audio/mpeg"]');
        if (source.length > 0) {
          const srcPath = $(source).attr('src');
          if (srcPath) {
            audioUrl = `https://dictionary.cambridge.org${srcPath}`;
            return false; // Break the loop when found
          }
        }
      }
    });
    
    // If not found, try looking at audio elements with US pronunciation directly
    if (!audioUrl) {
      $('audio').each((index, element) => {
        const id = $(element).attr('id');
        // Check if it's a US pronunciation audio element
        if (id && id.includes('us_pron')) {
          const source = $(element).find('source[type="audio/mpeg"]');
          if (source.length > 0) {
            const srcPath = $(source).attr('src');
            if (srcPath) {
              audioUrl = `https://dictionary.cambridge.org${srcPath}`;
              return false; // Break the loop when found
            }
          }
        }
      });
    }
    
    if (audioUrl) {
      console.log(`Found pronunciation URL for "${word}": ${audioUrl}`);
      return audioUrl;
    } else {
      console.log(`No pronunciation found for "${word}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching pronunciation for "${word}":`, error);
    return null;
  }
}; 