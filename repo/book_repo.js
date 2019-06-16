const axios = require('axios');
const qs = require('qs');

const BASE_URL='http://fuseki:3030';

const headers = {
  'Accept': 'application/sparql-results+json,*/*;q=0.9',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
}

exports.getBooks = async name => {
  const queryData = {
    query: 
    `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX t: <http://www.semanticweb.org/boi/ontologies/2019/4/perpustakaan#>
    
    SELECT ?name ?category ?author ?publisher ?library
    WHERE {
      ?books rdf:type t:Book;
        t:name ?name;
        t:kindOf ?categoryInstance;
        t:writtenBy ?authorInstance;
        t:publishedBy ?publisherInstance;
        t:archivedIn ?libraryInstance.
      
      ?categoryInstance t:name ?category.
      ?authorInstance t:name ?author.
      ?publisherInstance t:name ?publisher.
      ?libraryInstance t:name ?library.

      filter regex(?name, "${name}").
    }`
  };

  try{
    const { data } = await axios(`${BASE_URL}/perpustakaan/query`, {
      method: 'POST',
      headers,
      data: qs.stringify(queryData)
    });

    return data;
  }
  catch(err){
    console.error(err);
    return Promise.reject(err);
  }
}

exports.getSuggestions = async categories => {
  try{

    if (categories == undefined || categories.length == 0) {

      const queryData = {
        query: 
        `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX t: <http://www.semanticweb.org/boi/ontologies/2019/4/perpustakaan#>
        
        SELECT ?categories
        WHERE {
          ?categoryInstances rdf:type t:Category;
            t:name ?categories;
		    }
        ORDER BY RAND()
        LIMIT 5`
      };
      
      const { data } = await axios(`${BASE_URL}/perpustakaan/query`, {
        method: 'POST',
        headers,
        data: qs.stringify(queryData)
      });
      
      data.results.bindings.forEach(category => categories.push(category.categories.value));
    }

    const suggestions = [];

    for (const category of categories){

      const queryData = {
        query: 
        `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX t: <http://www.semanticweb.org/boi/ontologies/2019/4/perpustakaan#>
        
        SELECT ?name ?category ?author ?publisher ?library
        WHERE {
          ?books rdf:type t:Book;
            t:name ?name;
            t:kindOf ?categoryInstance;
            t:writtenBy ?authorInstance;
            t:publishedBy ?publisherInstance;
            t:archivedIn ?libraryInstance.

          ?categoryInstance t:name ?category.
          ?authorInstance t:name ?author.
          ?publisherInstance t:name ?publisher.
          ?libraryInstance t:name ?library.
    
          filter regex(?category, "${category}").
        }
        LIMIT 3`
      };

      const { data } = await axios(`${BASE_URL}/perpustakaan/query`, {
        method: 'POST',
        headers,
        data: qs.stringify(queryData)
      });

      suggestions.push(data);
    }

    return suggestions;
  }
  catch(err){
    console.error(err);
    return Promise.reject(err);
  }
}

module.exports = exports;