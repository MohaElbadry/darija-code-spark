import { supabase } from '../integrations/supabase/client';

// Define initial learning paths
const INITIAL_LEARNING_PATHS = [
  {
    name: 'Web Development',
    description: 'Learn how to create websites and web applications',
    icon: 'code',
  },
  {
    name: 'Mobile Development',
    description: 'Learn how to create mobile applications',
    icon: 'smartphone',
  },
  {
    name: 'Data Science',
    description: 'Learn how to analyze and visualize data',
    icon: 'database',
  },
  {
    name: 'Artificial Intelligence',
    description: 'Learn about machine learning and AI concepts',
    icon: 'brain',
  },
  {
    name: 'Blockchain',
    description: 'Learn about blockchain technology and cryptocurrencies',
    icon: 'link',
  },
];

/**
 * Seeds the learning_paths table with initial data if it's empty
 */
export async function seedLearningPaths() {
  try {
    // Check if we already have paths
    const { data: existingPaths, error: checkError } = await supabase
      .from('learning_paths')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing paths:', checkError);
      return;
    }
    
    // If we already have paths, don't seed
    if (existingPaths && existingPaths.length > 0) {
      console.log('Learning paths already exist, skipping seed');
      return;
    }
    
    // Insert initial paths
    const { data, error } = await supabase
      .from('learning_paths')
      .insert(INITIAL_LEARNING_PATHS)
      .select();
    
    if (error) {
      console.error('Error seeding learning paths:', error);
      return;
    }
    
    console.log('Successfully seeded learning paths:', data);
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

export default seedLearningPaths; 