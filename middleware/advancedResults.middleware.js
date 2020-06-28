const advancedResults = (model, populate) => async (request, res, next) => {
  let query;

  // copy request query
  const requestQuery = { ...request.query };

  // fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removeFields and remove them from requestQuery
  removeFields.forEach(field => delete requestQuery[field]);

  // create query string, create operators like $gt, $gte, etc..
  let queryString = JSON.stringify(requestQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );

  // building query
  query = model.find(JSON.parse(queryString));

  // selecting only specific fields
  if (request.query.select) {
    const fields = request.query.select.split(',').join(' ');
    query.select(fields);
  }

  // sorting
  if (request.query.sort) {
    const sortBy = request.query.sort.split(',').join(' ');
    query.sort(sortBy);
  } else {
    query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(request.query.page, 10) || 1;
  const limit = parseInt(request.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if(populate) {
    query = query.populate(populate);
  }

  // executing query
  const results = await query;

  // pagination results
  const pagination = {
    total
  };

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  next();
};

module.exports = advancedResults;
