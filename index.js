 //@ts-check
/**
 * Custom error class for invalid paths
 *
 * @extends Error
 */
class InvalidPathError extends Error {
  /**
   * Creates a new instance of the InvalidPathError class
   *
   * @param {string} message - The error message
   */
  constructor(message) {
    super(message);
    this.name = 'InvalidPathError';
  }
}

/**
 * Custom error class for missing arguments
 *
 * @extends Error
 */
class MissingArgumentsError extends Error {
  /**
   * Creates a new instance of the MissingArgumentsError class
   *
   * @param {string} message - The error message
   */
  constructor(message) {
    super(message);
    this.name = 'MissingArgumentsError';
  }
}

/**
 * Custom error class for failed requests
 *
 * @extends Error
 */
class FailedRequestError extends Error {
  /**
   * Creates a new instance of the FailedRequestError class
   *
   * @param {string} message - The error message
   */
  constructor(message) {
    super(message);
    this.name = 'FailedRequestError';
  }
}

/**
 * Custom error class for empty arguments
 *
 * @extends Error
 */
class EmptyArgumentsError extends Error {
  /**
   * Creates a new instance of the EmptyArgumentsError class
   *
   * @param {string} message - The error message
   */
  constructor(message) {
    super(message);
    this.name = 'EmptyArgumentsError';
  }
}



/**
 * Class for filtering and returning a list of methods
 */
class QueryHelpers {
  /**
   * Creates a new instance of the QueryHelpers class
   *
   * @param {Array} methods - An array of methods
   */
  constructor(...methods) {
    /**
     * The array of methods
     *
     * @type {Array}
     */
    this.methods = methods;
  }

  /**
   * Returns a new object with the methods assigned as properties
   *
   * @param {Array} methods - An array of methods
   *
   * @returns {Object} - An object with the methods assigned as properties
   */
  #returnMethods(...methods) {
    return methods
      .reduce((newObj, currentMethod) => Object.defineProperties(newObj, {
        [currentMethod.name]: {
          value: currentMethod
        }
      }), Object.defineProperties({}, {}));
  }

  /**
   * Returns a new object with the specified methods assigned as properties
   *
   * @param {Array} pickedMethodsNames - An array of method names to pick
   *
   * @returns {Object} - An object with the specified methods assigned as properties
   */
  pick(...pickedMethodsNames) {
    let methodList = [];
    for (let pickedMethod of pickedMethodsNames) {
      const [method] = this.methods.filter(method => method.name === pickedMethod);
      methodList.push(method);
    }
    return this.#returnMethods(...methodList);
  }

  /**
   * Returns a new object with the methods that are not in the specified list assigned as properties
   *
   * @param {Array} omitedMethodsNames - An array of method names to omit
   *
   * @returns {Object} - An object with the methods that are not in the specified list assigned as properties
   */
  omit(...omitedMethodsNames) {
    const remainingMethods = this.methods.reduce((methods, currentMethod) => {
      let allowedMethod;
      for (let omitedMethodName of omitedMethodsNames) {
        if (currentMethod.name !== omitedMethodName) {
          allowedMethod = currentMethod;
        }
      }
      if (allowedMethod) {
        return [...methods, allowedMethod];
      } else {
        return methods;
      }
    }, []);

    return this.#returnMethods(...remainingMethods);
  }
}


 class ApiQueryBuilder extends QueryHelpers {
   baseURL
   urlPath
   url
   returnType
   headers
   data
   constructor() {
     super()
   }

   addBookSearchByAuthorDefaults(path, authorName, limit, format) {
     if (arguments.length < 3) {
       throw new MissingArgumentsError(`requirement argument are 3, received: ${arguments.length}`)
     }

     if (!Array.from(arguments).every(arg => typeof arg == 'string' && arg.length > 1)) {
       throw Error('All arguments must be a string and cannot be empty')
     }

     if (path.split('')[0] !== '/') {
       throw new InvalidPathError(`path ${path} is invalid, must begin with a '/'`)
     }
     const formattedAuthorName= authorName.split(' ').length > 0 ? authorName.replace(' ', '%20'): authorName
     
     let url = new URL(path, 'http://api.book-seller-example.com')
     
     url.searchParams.append('q', formattedAuthorName)
     url.searchParams.append('limit', limit)
     this.returnType = format;
     url.searchParams.append('format', format)

     this.url = url;
     return this.pick(this.addQueryParams.name, this.overwritePath.name)
   }

   overwritePath(path) {
     if (arguments.length < 1) {
       throw new MissingArgumentsError(`requirement argument are 1, received: ${arguments.length}`)
     }
     if (path.split('')[0] !== '/') {
       throw new InvalidPathError(`path ${path} is invalid, must begin with a '/' `)
     }
     this.url = this.url.pathname = path;
     return this.pick(this.addQueryParams.name)
   }

   setBaseURL(baseURL) {
     this.baseURL = baseURL
     return this.pick(this.addQueryParams.name)
   }


   setURLPath(path) {
     if (path.split('')[0] !== '/') {
       throw new InvalidPathError(`path ${path} is invalid, must begin with a '/' `)
     }
     this.urlPath = path
     return this.pick(this.addQueryParams.name)
   }



   addQueryParams(queryType, queryArg) {

     if (arguments.length !== 2) {
       throw new MissingArgumentsError(`Two Arguments Required, you've specified ${arguments.length}`)
     }
     this.url = new URL(this.urlPath, this.baseURL)
     this.url.searchParams.append(queryType, queryArg)
     return this.pick(this.addQueryParams.name, this.setHeaders.name)
   }

   setHeaders(returnType) {

     if (returnType == "" && !['json', 'xml'].includes(returnType)) {
       throw Error("return type must not be empty and of either json or xml")
     }
     this.headers = new Headers({
       'Accept': `application/${returnType}`
     })

     return this.pick(this.mapResponseData.name)
   }
   mapResponseData(mapFunction) {
     this.mapFunction = this.mapFunction = mapFunction
     return this.pick(this.execute.name)
   }
   async execute() {
     try {

       let response = await fetch(this.url, {
         headers: this.headers,
         method: 'GET'
       });

       if (response.status !== 200) {
         return `Request to ${this.url} failed with response code: Err: ${response.status}`
       }

       const jsonResponse = await response.json()
       const responseData = Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse]
       try {
         return responseData.map(this.mapFunction)
       } catch (err) {
         console.log(err)
       }
     } catch (err) {
       console.error(`Error from fetch request is: ${err}`)
     }
   }
 }


 modules.export = ApiQueryBuilder