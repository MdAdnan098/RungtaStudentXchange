export const applySearch = (query, queryParams) => {
  const { search } = queryParams;
  if (search) {
    return query.find({ $text: { $search: search } });
  }
  return query;
};

export const applyFilters = (query, queryParams) => {
  const { category, condition, minPrice, maxPrice, studentOnly } = queryParams;

  const filters = {};

  if (category) filters.category = category;
  if (condition) filters.condition = condition;

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  if (Object.keys(filters).length > 0) {
    query = query.find(filters);
  }

  if (studentOnly === "true") {
    query = query.populate({
      path: "seller",
      match: { isStudentVerified: true },
    });
  }

  return query;
};

export const applySort = (query, queryParams) => {
  const { sort } = queryParams;

  switch (sort) {
    case "price_asc":
      return query.sort({ price: 1 });
    case "price_desc":
      return query.sort({ price: -1 });
    case "popular":
      return query.sort({ viewCount: -1 });
    case "newest":
    default:
      return query.sort({ createdAt: -1 });
  }
};

export const applyPagination = (query, queryParams) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 20;
  const skip = (page - 1) * limit;

  return query.skip(skip).limit(limit);
};
