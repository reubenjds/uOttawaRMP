const {GraphQLClient, gql} = require('graphql-request');
console.log("background.js loaded");

const searchTeacherQuery = gql`
query NewSearchTeachersQuery($text: String!, $schoolID: ID!)
{
  newSearch {
    teachers(query: {text: $text, schoolID: $schoolID}) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          school {
            name
            id
          }
        }
      }
    }
  }
}
`;


const getTeacherQuery = gql`
query TeacherRatingsPageQuery(
  $id: ID!
) {
  node(id: $id) {
    ... on Teacher {
      id
      firstName
      lastName
      school {
        name
        id
        city
        state
      }
      avgDifficulty
      avgRating
      department
      numRatings
      legacyId
      wouldTakeAgainPercent
    }
    id
  }
}
`;

const AUTH_TOKEN = 'dGVzdDp0ZXN0';

const client = new GraphQLClient('https://www.ratemyprofessors.com/graphql', {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`
  }
});

const searchTeacher = async (professorName, schoolID) => {
  console.log("searchTeacher called");
  console.log(professorName);
  console.log(typeof professorName);
  console.log(schoolID);
  const response = await client.request(searchTeacherQuery, {
    text: professorName,
    schoolID
  });

  if (response.newSearch.teachers === null) {
    return [];
  }

  return response.newSearch.teachers.edges.map((edge) => edge.node);
};

const getTeacher = async (id) => {
  const response = await client.request(getTeacherQuery, {id});

  return response.node;
};

async function getAvgRating(professorName) {
  console.log('1: ', professorName);
  const teachers = await searchTeacher(professorName, 'U2Nob29sLTE0OTU=');
  console.log(teachers);
  const teacherID = teachers[0].id;
  const teacher = await getTeacher(teacherID);
  const avgRating = teacher.avgRating;
  console.log(teacher);
  console.log(avgRating);

  return avgRating;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received message from content script:', request);
  console.log('test:', request.professorName);

  getAvgRating(request.professorName).then(response => {
    sendResponse(response);
  });
  return true;
});