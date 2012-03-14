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
                         [ "keywordString", "queryFields", "bMapToApps" ]);
  
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
		
    /*
     *  This work is being done in MApps._populateSearch(), WRONGLY.
     *  The code in MApps._populateSearch() should be refactored to below.
     * As in, MApps._populateSearch() should just call this function.
		 
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
     * NOTE: There is no ordering of the returned Apps. This is simply a 
     * keyword query.
     *
     * @param keywords {Array}
     *   An array of words to query on.
     *
     * @param queryFields {Array?}
     *   An array of strings of App data fields which are to be checked for
     *   the keyword(s). The array may contain none or any or all of the
     *   following:
     *
     *     "title"
     *     "description"
     *     "tags"
     *
     *   If the queryFields parameter is not provided, assume 'all fields'.
     *
     * @param bMapToApps {Boolean}
     *   If true, the returned array is of ObjAppData data; If false, the
     *   returned array is the list of UIDs to those ObjAppData objects.
     *
     * @return {Array}
     *   If bMapToApps is true, then this is an array of objects containing
     *   info about apps which contain the word or words in the keyword
     *   string. If bMapToApps is false, then this is an array of UIDs of apps
     *   in which the specified keywords were found.
     *
     *   Results are sorted in decreasing order of the number of fields in
     *   which the results were found.
     */
    keywordSearch : function(keywords, queryFields, bMapToApps, error)
    {
      var criteria;
      var criteriaChild;
      var searchResults;
      var uidArr;
      var queryResultsMap = {};
      var queryResult;
      
      // Make sure there is at least 1 keyword given
      if (! qx.lang.Type.isArray(keywords) || keywords.length == 0)
      {
        error.setCode(3);
        error.setMessage("At least 1 keyword required for keyword search");
        return error;
      }

      if (! queryFields)
      {
        queryFields = [ "title", "description", "tags" ];
      }

      // Make sure all keyword searches are doing lowercase. ObjSearch stores
      // all entries in lowercase
      keywords = keywords.map(
        function(keyword)
        {
          return keyword.toLowerCase();
        });
           
      // Remove all stop words from the keyword array
      keywords = qx.lang.Array.exclude(keywords,
                                       aiagallery.dbif.MSearch.stopWordArr);
      
      // For each provided keyword...
      keywords.forEach(
        function(keyword)
        {
          queryResult = liberated.dbif.Entity.query("aiagallery.dbif.ObjSearch",
                                                    {
                                                      type  : "element",
                                                      field : "word",
                                                      value : keyword
                                                    });
          
          // Collect all the single word queries in a map
          queryResult.forEach(
            function(obj)
            {
              // Is this result for a field that we care about?
              if (! qx.lang.Array.contains(queryFields, obj.appField))
              {
                // Nope. Nothing to do.
                return;
              }

              // Have we seen this app yet?
              if (typeof queryResultsMap[obj.appId] === "undefined")
              {
                // Nope. Create an array of keywords in which we found it.
                queryResultsMap[obj.appId] = [];
              }
              
              // Push this keyword onto the array
              queryResultsMap[obj.appId].push(keyword);
            });
        });
      
      // Get the list of UIDs of apps we found. Keys are strings, but UIDs are
      // numbers, so map to numbers at the same time.
      uidArr = qx.lang.Object.getKeys(queryResultsMap).map(
        function(uid)
        {
          return Number(uid);
        });
      
      // Sort the UIDs based on the number of keyword matches
      uidArr.sort(
        function(uid1, uid2)
        {
          var             matches1;
          var             matches2;
          
          // Find the number of keyword matches for uid1
          matches1 =
            keywords.length - 
            (keywords.length - queryResultsMap[uid1].length);
          
          // Find the number of keyword matches for uid2
          matches2 =
            keywords.length - 
            (keywords.length - queryResultsMap[uid2].length);
          
          // The one with the most matches wins.
          // Does the second one have more matches?
          if (matches2 > matches1)
          {
            // Yup. So its uid comes earlier in the list.
            return 1;
          }
          
          // Does the first one have more matches?
          if (matches1 > matches2)
          {
            // Yup, so its uid comes earlier in the list.
            return -1;
          }
          
          // They're equal, so order is irrelevant.
          return 0;
        },
        this);

      // If we were asked to return an array of apps...
      if (bMapToApps)
      {
        // then retrieve and return them.
        return this.getAppListByList(uidArr);
      }

      // Otherwise, just return the array of UIDs
      return uidArr;
    }
  }
});
