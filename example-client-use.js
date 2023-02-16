const ApiQueryBuilder = require('./index')

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