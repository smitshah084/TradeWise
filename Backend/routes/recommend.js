// const data = {
//     '1,2': [5, 4, 2],
//     '3,5': [10, 15, 20],
//     '4,6': [25, 30, 35],
// };
/**
 * Recommends courses based on Jaccard similarity between user interests and course interests
 * @param {Object[]} interactions - Array of objects mapping interest-course pairs to user IDs
 * @param {number} numInterests - Total number of interests in the system
 * @param {number} numCourses - Total number of courses in the system
 * @param {number[]} userInterests - Array of interest IDs the user has
 * @returns {number[]} - Sorted array of recommended course IDs
 */
function getRecommendations(interactions, numInterests, numCourses, userInterests) {
    // Step 1: Create interest-course matrix
    const interestCourseMatrix = createInterestCourseMatrix(interactions, numInterests, numCourses);
    // Step 2: Calculate Jaccard similarity between user interests and each course
    const courseScores = calculateJaccardScores(interestCourseMatrix, userInterests);
    
    // Step 3: Sort courses by score and return recommendations
    return sortRecommendations(courseScores);
  }
  
  /**
   * Creates a matrix showing which interests are associated with which courses
   */
  function createInterestCourseMatrix(interactions, numInterests, numCourses) {
    // Initialize matrix with empty sets
    const matrix = {};
    
    // For each interest, initialize an empty set of courses
    for (let i = 1; i <= numInterests; i++) {
      matrix[i] = new Set();
    }
    
    // For each course, initialize an empty set of interests
    const courseInterests = {};
    for (let j = 1; j <= numCourses; j++) {
      courseInterests[j] = new Set();
    }
    
    // Parse interactions to populate matrix
    interactions.forEach(interaction => {
      Object.keys(interaction).forEach(key => {
        // Key could be "18,16" or just "18"
        const interestIds = key.split(',').map(id => parseInt(id));
        const courseIds = interaction[key];
        
        // For each interest, add all associated courses
        interestIds.forEach(interestId => {
          courseIds.forEach(courseId => {
            matrix[interestId].add(courseId);
            courseInterests[courseId].add(interestId);
          });
        });
      });
    });
    
    return { interestCourses: matrix, courseInterests };
  }
  
  /**
   * Calculates Jaccard similarity scores for each course based on user interests
   */
  function calculateJaccardScores(matrix, userInterests) {
    const { interestCourses, courseInterests } = matrix;
    const scores = {};
    const userInterestsSet = new Set(userInterests);
    
    // Get all unique courses associated with user interests
    const candidateCourses = new Set();
    userInterests.forEach(interestId => {
      if (interestCourses[interestId]) {
        interestCourses[interestId].forEach(courseId => {
          candidateCourses.add(courseId);
        });
      }
    });
    
    // Calculate Jaccard similarity for each candidate course
    candidateCourses.forEach(courseId => {
      // Skip if course has no associated interests (should not happen)
      if (!courseInterests[courseId]) return;
      
      // Get interests associated with this course
      const courseInterestsSet = courseInterests[courseId];
      
      // Calculate intersection size
      const intersection = new Set([...userInterestsSet].filter(x => courseInterestsSet.has(x)));
      
      // Calculate union size
      const union = new Set([...userInterestsSet, ...courseInterestsSet]);
      
      // Calculate Jaccard similarity: |A ∩ B| / |A ∪ B|
      scores[courseId] = intersection.size / union.size;
    });
    
    return scores;
  }
  
  /**
   * Sorts courses by their Jaccard scores and returns sorted course IDs
   */
  function sortRecommendations(courseScores) {
    return Object.entries(courseScores)
      .sort((a, b) => b[1] - a[1]) // Sort by score in descending order
      .map(entry => parseInt(entry[0])); // Extract course IDs
  }
  
  // Example usage
  const interactions = [
    { "18,16": [57] },
    { "18": [3, 4] },
    {"17":[3]}
  ];
  
  const numInterests = 20; // Example: system has 20 interests total
  const numCourses = 60;   // Example: system has 60 courses total
  const userInterests = [121]; // User is interested in interests 1 and 2
  
  const recommendations = getRecommendations(interactions, numInterests, numCourses, userInterests);
  console.log(userInterests,"Recommended courses:", recommendations);


  module.exports = {
    getRecommendations
  };