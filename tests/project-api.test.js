// Simple integration test for project creation API
// This tests the normalization functionality and UUID generation

import http from 'http';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getAuthToken() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/signin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const response = await makeRequest(options, {
    username: 'admin',
    password: 'password'
  });
  
  return response.data.data.token;
}

async function testProjectCreation() {
  try {
    console.log('Starting project creation API tests...\n');
    
    const token = await getAuthToken();
    console.log('✓ Authentication successful\n');
    
    const testCases = [
      {
        name: 'String inputs normalization',
        project: {
          title: 'Test String Normalization',
          description: 'Testing string to array conversion',
          technologies: 'React, TypeScript, Node.js',
          images: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
          category: 'web'
        },
        expectations: {
          technologies: ['React', 'TypeScript', 'Node.js'],
          images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']
        }
      },
      {
        name: 'Array inputs preservation',
        project: {
          title: 'Test Array Preservation',
          description: 'Testing array inputs are preserved',
          technologies: ['Vue.js', 'Nuxt.js'],
          images: ['https://example.com/vue.jpg'],
          category: 'web'
        },
        expectations: {
          technologies: ['Vue.js', 'Nuxt.js'],
          images: ['https://example.com/vue.jpg']
        }
      },
      {
        name: 'Edge case handling',
        project: {
          title: 'Test Edge Cases',
          description: 'Testing trimming and empty value filtering',
          technologies: ' Angular , , TypeScript , ',
          images: 'https://example.com/img.jpg, ,  ',
          category: 'web'
        },
        expectations: {
          technologies: ['Angular', 'TypeScript'],
          images: ['https://example.com/img.jpg']
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);
      
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await makeRequest(options, testCase.project);
      
      if (response.status !== 201) {
        console.log(`✗ Failed: Expected status 201, got ${response.status}`);
        console.log(`  Response: ${JSON.stringify(response.data)}`);
        continue;
      }
      
      const project = response.data.data;
      
      // Check UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(project.id)) {
        console.log(`✗ Failed: ID is not a valid UUID v4: ${project.id}`);
        continue;
      }
      
      // Check technologies array
      if (!Array.isArray(project.technologies) || 
          JSON.stringify(project.technologies) !== JSON.stringify(testCase.expectations.technologies)) {
        console.log(`✗ Failed: Technologies mismatch`);
        console.log(`  Expected: ${JSON.stringify(testCase.expectations.technologies)}`);
        console.log(`  Got: ${JSON.stringify(project.technologies)}`);
        continue;
      }
      
      // Check images array
      if (!Array.isArray(project.images) || 
          JSON.stringify(project.images) !== JSON.stringify(testCase.expectations.images)) {
        console.log(`✗ Failed: Images mismatch`);
        console.log(`  Expected: ${JSON.stringify(testCase.expectations.images)}`);
        console.log(`  Got: ${JSON.stringify(project.images)}`);
        continue;
      }
      
      console.log(`✓ Passed: ${testCase.name}`);
      console.log(`  ID: ${project.id}`);
      console.log(`  Technologies: ${JSON.stringify(project.technologies)}`);
      console.log(`  Images: ${JSON.stringify(project.images)}\n`);
    }
    
    console.log('All tests completed!');
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

// Run tests
testProjectCreation();