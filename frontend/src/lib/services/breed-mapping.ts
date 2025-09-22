// Breed mapping utility for integrating AI classification with the breed database
import breedDatabase from '../../../../data/breeds-database.json';

// Types for the breed database
interface BreedDatabaseEntry {
  id: number;
  breedName: string;
  category: 'Cattle' | 'Buffalo';
  origin: string;
  primaryUse: string;
  milkYield: string;
  bodyColor: string;
  uniqueTraits: string;
  conservationStatus: string;
  [key: string]: any;
}

// Breed name mapping for variations and common names
const BREED_NAME_MAPPINGS: { [key: string]: string[] } = {
  'Gir': ['gir', 'gyr', 'geer'],
  'Sahiwal': ['sahiwal', 'sahival', 'sahivali', 'lola', 'lambi bar', 'montgomery'],
  'Red Sindhi': ['red sindhi', 'sindhi', 'red sindhi cattle', 'malir'],
  'Tharparkar': ['tharparkar', 'tharparkari', 'thari', 'cutchi', 'white sindhi'],
  'Kankrej': ['kankrej', 'kankrej cattle', 'wadad', 'waged', 'vadhiyar'],
  'Ongole': ['ongole', 'nellore', 'nellore ongole'],
  'Hariana': ['hariana', 'hariyana', 'hansi'],
  'Rathi': ['rathi', 'rath'],
  'Malvi': ['malvi', 'manthani', 'mahadeopuri'],
  'Nagori': ['nagori', 'nagauri', 'rath'],
  'Hallikar': ['hallikar', 'hallikedu'],
  'Amritmahal': ['amritmahal', 'doddar'],
  'Deoni': ['deoni', 'dongarpati', 'wannera'],
  'Krishna Valley': ['krishna valley', 'krishna'],
  'Pulikulam': ['pulikulam', 'jallikattu'],
  'Kangaroo': ['kangaroo', 'kangayam'],
  'Umblachery': ['umblachery', 'jathi madu'],
  'Vechur': ['vechur', 'kasargod dwarf'],
  
  // Buffalo breeds
  'Murrah': ['murrah', 'delhi', 'kundi'],
  'Nili Ravi': ['nili ravi', 'nili-ravi', 'ravi', 'nili'],
  'Surti': ['surti', 'charotar', 'deccani'],
  'Jaffarabadi': ['jaffarabadi', 'gir', 'gyr'],
  'Mehsana': ['mehsana', 'mehsani'],
  'Bhadawari': ['bhadawari', 'yamuna pari'],
  'Nagpuri': ['nagpuri', 'berari'],
  'Pandharpuri': ['pandharpuri', 'pandharpuri'],
  'Toda': ['toda', 'toda buffalo']
};

// Inverse mapping for quick lookup
const INVERSE_BREED_MAPPING: { [key: string]: string } = {};
Object.entries(BREED_NAME_MAPPINGS).forEach(([standardName, variations]) => {
  variations.forEach(variation => {
    INVERSE_BREED_MAPPING[variation.toLowerCase()] = standardName;
  });
});

/**
 * Find breed in database by name with fuzzy matching
 */
export function findBreedInDatabase(breedName: string): BreedDatabaseEntry | null {
  const searchName = breedName.toLowerCase().trim();
  
  // First try exact match
  let found = breedDatabase.find(breed => 
    breed.breedName.toLowerCase() === searchName
  );
  
  if (found) return found as BreedDatabaseEntry;
  
  // Try mapping variations
  const standardName = INVERSE_BREED_MAPPING[searchName];
  if (standardName) {
    found = breedDatabase.find(breed => 
      breed.breedName.toLowerCase() === standardName.toLowerCase()
    );
    if (found) return found as BreedDatabaseEntry;
  }
  
  // Try partial matching
  found = breedDatabase.find(breed => {
    const breedNameLower = breed.breedName.toLowerCase();
    return breedNameLower.includes(searchName) || searchName.includes(breedNameLower);
  });
  
  if (found) return found as BreedDatabaseEntry;
  
  // Try fuzzy matching on unique traits or origin
  found = breedDatabase.find(breed => {
    const traits = breed.uniqueTraits?.toLowerCase() || '';
    const origin = breed.origin?.toLowerCase() || '';
    return traits.includes(searchName) || origin.includes(searchName);
  });
  
  return found as BreedDatabaseEntry || null;
}

/**
 * Get breed recommendations based on animal type and characteristics
 */
export function getBreedRecommendations(
  animalType: 'cattle' | 'buffalo', 
  characteristics?: string[]
): BreedDatabaseEntry[] {
  const categoryFilter = animalType === 'cattle' ? 'Cattle' : 'Buffalo';
  
  let breeds = breedDatabase.filter(breed => 
    breed.category === categoryFilter
  ) as BreedDatabaseEntry[];
  
  if (characteristics && characteristics.length > 0) {
    // Score breeds based on characteristic matches
    const scoredBreeds = breeds.map(breed => {
      let score = 0;
      const searchText = `${breed.bodyColor} ${breed.uniqueTraits} ${breed.origin}`.toLowerCase();
      
      characteristics.forEach(char => {
        if (searchText.includes(char.toLowerCase())) {
          score += 1;
        }
      });
      
      return { breed, score };
    });
    
    // Sort by score and return top matches
    return scoredBreeds
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.breed);
  }
  
  // Return popular breeds if no characteristics
  const popularBreeds = animalType === 'cattle' 
    ? ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Holstein Friesian']
    : ['Murrah', 'Nili Ravi', 'Surti', 'Jaffarabadi', 'Mehsana'];
  
  return breeds.filter(breed => 
    popularBreeds.some(popular => 
      breed.breedName.toLowerCase().includes(popular.toLowerCase())
    )
  ).slice(0, 5);
}

/**
 * Map Google Vision labels to breed characteristics
 */
export function mapLabelsToBreedCharacteristics(labels: string[]): string[] {
  const characteristics: string[] = [];
  
  labels.forEach(label => {
    const labelLower = label.toLowerCase();
    
    // Color mappings
    if (labelLower.includes('white')) characteristics.push('white');
    if (labelLower.includes('black')) characteristics.push('black');
    if (labelLower.includes('red') || labelLower.includes('reddish')) characteristics.push('red');
    if (labelLower.includes('brown')) characteristics.push('brown');
    if (labelLower.includes('grey') || labelLower.includes('gray')) characteristics.push('grey');
    
    // Size indicators
    if (labelLower.includes('large') || labelLower.includes('big')) characteristics.push('large');
    if (labelLower.includes('small') || labelLower.includes('compact')) characteristics.push('small');
    
    // Features
    if (labelLower.includes('horn')) characteristics.push('horned');
    if (labelLower.includes('hump')) characteristics.push('humped');
    if (labelLower.includes('dairy')) characteristics.push('dairy');
    if (labelLower.includes('milk')) characteristics.push('milk');
    
    // Regional indicators
    if (labelLower.includes('indian')) characteristics.push('indian');
    if (labelLower.includes('zebu')) characteristics.push('zebu');
    if (labelLower.includes('brahman')) characteristics.push('brahman');
  });
  
  return Array.from(new Set(characteristics)); // Remove duplicates
}

/**
 * Enhance AI classification result with database information
 */
export function enhanceClassificationWithDatabase(
  breedName: string, 
  animalType: 'cattle' | 'buffalo'
): {
  breedInfo: BreedDatabaseEntry | null;
  alternatives: BreedDatabaseEntry[];
  confidence: number;
} {
  // Find the breed in database
  const breedInfo = findBreedInDatabase(breedName);
  
  // Get alternative recommendations
  const alternatives = getBreedRecommendations(animalType)
    .filter(breed => breed.breedName !== breedInfo?.breedName)
    .slice(0, 5);
  
  // Calculate confidence based on database match
  let confidence = 0.6; // Base confidence
  
  if (breedInfo) {
    confidence = 0.85; // Higher confidence if found in database
    
    // Adjust based on conservation status
    switch (breedInfo.conservationStatus?.toLowerCase()) {
      case 'stable':
        confidence += 0.05;
        break;
      case 'vulnerable':
        confidence += 0.02;
        break;
      case 'endangered':
        confidence -= 0.02;
        break;
      case 'critical':
        confidence -= 0.05;
        break;
    }
    
    // Adjust based on primary use (dairy breeds might be more recognizable)
    if (breedInfo.primaryUse?.toLowerCase().includes('milk')) {
      confidence += 0.03;
    }
  }
  
  return {
    breedInfo,
    alternatives,
    confidence: Math.min(confidence, 0.95) // Cap at 95%
  };
}

/**
 * Get comprehensive breed information for UI display
 */
export function getBreedDisplayInfo(breedName: string): {
  displayName: string;
  category: string;
  origin: string;
  primaryUse: string;
  milkYield: string;
  bodyColor: string;
  uniqueTraits: string;
  conservationStatus: string;
  isInDatabase: boolean;
} {
  const breedInfo = findBreedInDatabase(breedName);
  
  if (breedInfo) {
    return {
      displayName: breedInfo.breedName,
      category: breedInfo.category,
      origin: breedInfo.origin,
      primaryUse: breedInfo.primaryUse,
      milkYield: breedInfo.milkYield,
      bodyColor: breedInfo.bodyColor,
      uniqueTraits: breedInfo.uniqueTraits,
      conservationStatus: breedInfo.conservationStatus,
      isInDatabase: true
    };
  }
  
  // Return default info for unrecognized breeds
  return {
    displayName: breedName,
    category: 'Unknown',
    origin: 'Unknown',
    primaryUse: 'Unknown',
    milkYield: 'Data not available',
    bodyColor: 'Various colors',
    uniqueTraits: 'Traditional livestock breed',
    conservationStatus: 'Unknown',
    isInDatabase: false
  };
}

/**
 * Get breed statistics for analytics
 */
export function getBreedStatistics() {
  const stats = {
    totalBreeds: breedDatabase.length,
    cattleCount: breedDatabase.filter(b => b.category === 'Cattle').length,
    buffaloCount: breedDatabase.filter(b => b.category === 'Buffalo').length,
    conservationStatus: {} as { [key: string]: number },
    primaryUse: {} as { [key: string]: number }
  };
  
  breedDatabase.forEach(breed => {
    // Conservation status
    const status = breed.conservationStatus || 'Unknown';
    stats.conservationStatus[status] = (stats.conservationStatus[status] || 0) + 1;
    
    // Primary use
    const use = breed.primaryUse || 'Unknown';
    stats.primaryUse[use] = (stats.primaryUse[use] || 0) + 1;
  });
  
  return stats;
}

export default {
  findBreedInDatabase,
  getBreedRecommendations,
  mapLabelsToBreedCharacteristics,
  enhanceClassificationWithDatabase,
  getBreedDisplayInfo,
  getBreedStatistics
};