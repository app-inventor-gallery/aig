/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MSearch",
{
  construct : function()
  {
    
    this.registerService("aiagallery.features.keywordSearch",
                         this.keywordSearch,
                         [ "keywordString",
                           "queryFields",
                           "requestedFields"]);
  
  },
  
  statics :
  {
    /**
     * Array of all searching stopwords
     */
    stopWordArr : [ "a", "about", "above", "above", "across", "after",
                    "afterwards", "again", "against", "all", "almost", "alone",
                    "along", "already", "also","although","always","am",
                    "among", "amongst", "amoungst", "amount","an", "and",
                    "another", "any","anyhow","anyone","anything","anyway",
                    "anywhere", "are", "around", "as",  "at", "back","be",
                    "became", "because","become","becomes", "becoming", "been",
                    "before", "beforehand","behind", "being", "below",
                    "beside", "besides", "between", "beyond", "bill","both",
                    "bottom","but", "by", "call", "can", "cannot", "cant",
                    "co", "con","could", "couldnt", "cry", "de", "describe",
                    "detail", "do", "done", "down","due", "during", "each",
                    "eg", "eight", "either", "eleven","else", "elsewhere",
                    "empty", "enough", "etc", "even", "ever", "every",
                    "everyone", "everything", "everywhere", "except", "few",
                    "fifteen", "fify", "fill", "find", "fire","first", "five",
                    "for", "former", "formerly", "forty", "found", "four",
                    "from","front", "full", "further", "get", "give", "go",
                    "had", "has", "hasnt", "have","he", "hence", "her",
                    "here", "hereafter", "hereby", "herein", "hereupon",
                    "hers", "herself", "him", "himself", "his", "how", 
                    "however", "hundred", "ie","if", "in", "inc", "indeed",
                    "interest", "into", "is", "it", "its", "itself","keep",
                    "last", "latter", "latterly", "least", "less", "ltd",
                    "made", "many","may", "me", "meanwhile", "might", "mill",
                    "mine", "more", "moreover", "most","mostly", "move",
                    "much", "must", "my", "myself", "name", "namely", "neither",
                    "never", "nevertheless", "next", "nine", "no", "nobody",
                    "none", "noone","nor", "not", "nothing", "now", "nowhere",
                    "of", "off", "often", "on", "once","one", "only", "onto",
                    "or", "other", "others", "otherwise", "our", "ours",
                    "ourselves", "out", "over", "own","part", "per", "perhaps",
                    "please", "put","rather", "re", "same", "see", "seem",
                    "seemed", "seeming", "seems", "serious","several", "she",
                    "should", "show", "side", "since", "sincere", "six",
                    "sixty","so", "some", "somehow", "someone", "something",
                    "sometime", "sometimes","somewhere", "still", "such",
                    "system", "take", "ten", "than", "that", "the","their",
                    "them", "themselves", "then", "thence", "there",
                    "thereafter","thereby", "therefore", "therein",
                    "thereupon", "these", "they", "thick","thin", "third",
                    "this", "those", "though", "three", "through", "throughout",
                    "thru", "thus", "to", "together", "too", "top", "toward",
                    "towards", "twelve","twenty", "two", "un", "under",
                    "until", "up", "upon", "us", "very", "via","was", "we",
                    "well", "were", "what", "whatever", "when", "whence",
                    "whenever","where", "whereafter", "whereas", "whereby",
                    "wherein", "whereupon","wherever", "whether", "which",
                    "while", "whither", "who", "whoever", "whole","whom",
                    "whose", "why", "will", "with", "within", "without",
                    "would", "yet","you", "your", "yours", "yourself",
                    "yourselves", "the"]


  },
  
  members :
  {
	
		/**
		 * Helper function for populating the search database.
		 *
		 *
		 * Populating the database consists of:
		 *   Taking each element of keywordStringArray and
		 *     if the string contains anything useful, parse it into 
		 *     else trash it 
		 * NOTE: Should stop words be considered on add instead of search?
		 **/
		
		/* This work is being done in MApps._populateSearch(), WRONGLY.
		   The code in MApps._populateSearch() should be refactored to below.
		   As in, MApps._populateSearch() should just call this function.
		 
		 
		addSearchData : function(keywordStringArray)
		{
			
			// Use this regex to match a search acceptable word.
			// Example acceptable: 'This's', 'alPhA.123', '1234'
			//       unacceptable: '1', 'a'
			var acceptableWord = /\A[a-z0-9'\.]\Z/gi
		
			// Take each element of keywordStringArray as candidate
			   // Fill 
		
		
		},
		*/
		
    /**
     * Returns an array of App Info objects, which contain a word or words from
     * the keyword string. 
     * 
     * NOTE: The order of the returned apps is described under @return, below.
     * 
     * @param keywordString {String}
     * A space delimited string of words to query on. A returned App will
     * contain all of the words in the string, in any order.
     * 
     * @param queryFields {Array}
     * An array of strings of App data fields which are to be checked for the
     * keyword(s). The array may contain none or any or all of the following: 
     * 
     * "title"
     * "description"
     * "tags"
     * 
     * @param requestedFields {Map}
     * See MApps.appQuery() documentation
     * 
     * @return {Array}
     * An array of objects containing info about apps which contain the word or
     * words in the keyword string. The first results will be Apps that contain
     * all words from the keyword string if there are any. Following that are
     * all the results which contain one or many but not all of the words. There
     * are no more restrictions on order.
     *
		 * FIXME: queryFields needs implementation!
     */
    keywordSearch : function(keywordString, queryFields, requestedFields, error)
    {
      var keywordArr;
      var criteria;
      var criteriaChild;
      var searchResults;
      var uidArr = [];
      var queryResultsMap = {};
      var queryResult;
      var allWordResults = [];
      var otherResults = [];
      var curUID;
      
      // Make sure there is at least 1 keyword given
      if (keywordString === null || typeof keywordString === "undefined" ||
          keywordString === "")
      {
        error.setCode(3);
        error.setMessage("At least 1 keyword required for keyword search");
        return error;
      }

      // Necessary: Make sure all keyword search queries are in lowercase,
			//            becase ObjSearch stores all entries in lowercase
      keywordString = keywordString.toLowerCase();
           
      // The keyword string is space delimited, let's tokenize
      keywordArr = keywordString.split(" ");
      
      // Remove all stop words from the keyword array
      keywordArr = qx.lang.Array.exclude(keywordArr,
                                         aiagallery.dbif.MSearch.stopWordArr);
      
      // FIXME: Doing individual word queries (AAAH!!)
      keywordArr.forEach(function(keyword)
        {
      
          criteria = 
            {
              type  : "element",
              field : "word",
              value : keyword
            };
          
          queryResult = liberated.dbif.Entity.
													query("aiagallery.dbif.ObjSearch",
                                criteria,
                                null);
          
          // Collect all the single word queries in a map
          queryResult.forEach(
						function(obj)
            {
							if (typeof queryResultsMap[obj.appId] === "undefined")
              {
                  // We must make sure there is an array for this appId
                  queryResultsMap[obj.appId] = [];
              }
                                
							// Push this keyword into the array
              queryResultsMap[obj.appId].push(keyword);
            });
        });
      
      // All Apps which contained all keywords in the string should come first
      for ( curUID in queryResultsMap)
      {
        // So seperate those with all keywords and those without
        if (queryResultsMap[curUID].length === keywordArr.length)
        {
          allWordResults.push(parseInt(curUID, 10));
        }
        else
        {
          otherResults.push(parseInt(curUID, 10));
        }
      }
      
      // And place them in the proper order
      uidArr = allWordResults.concat(otherResults);
        
      // Finally, exchange array of UIDs for array of App Data objects using
      // MApps.getAppListByList() and return that
      return this.getAppListByList(uidArr, requestedFields);
      
    }
  }
});
