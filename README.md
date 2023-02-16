# Refactored API Client

## What I built

 A custom api client with a focus on the developer experience by implementing function chanining

## Todos

- Write tests
- Port to typescript

Examples of Usage

```js
// Normal Example Usage:
await new ApiQueryBuilder()
    .addBookSearchByAuthorDefaults('/by-author', "roald dahl", 100, 'json')
    .addQueryParams('genre', 'biography')
    .setHeaders('json')
    .setMapFunction(function (item) {
        return {
            title: item.book.title,
            author: item.book.author,
            isbn: item.book.isbn,
            quantity: item.stock.quantity,
            price: item.stock.price,
        }
    })
    .execute()
```

```js
//Custom Example Usage with base url overide:

await new ApiQueryBuilder()
    .addBookSearchByAuthorDefaults('/by-author', "roald dahl", '100', 'json')
    .overwritePath('v2/by-author')
    .addQueryParams('genre', 'biography')
    .setHeaders('json')
    .setMapFunction(function (item) {
        return {
            title: item.book.title,
            author: item.book.author,
            isbn: item.book.isbn,
            quantity: item.stock.quantity,
            price: item.stock.price,
        }
    })
    .execute()
```

```js
//Custom api endpoint with custom query parameters:

await new ApiQueryBuilder()
    .setBaseURL('https://custom-api')
    .setURLPath('/search')
    .addQueryParams('author', 'roald dahl')
    .addQueryParams('limit', '100')
    .setHeaders('xml')
    .setMapFunction(function (item) {
        return {
            title: item.childNodes[0].childNodes[0].nodeValue,
            author: item.childNodes[0].childNodes[1].nodeValue,
            isbn: item.childNodes[0].childNodes[2].nodeValue,
            quantity: item.childNodes[1].childNodes[0].nodeValue,
            price: item.childNodes[1].childNodes[1].nodeValue,
          };
    })
    .execute()
