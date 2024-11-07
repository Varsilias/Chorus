export function paginateResponse(
  data: [any, any],
  page?: number | string,
  limit?: number | string,
) {
  const [result, total] = data;

  page = page ? Number(page) : 1;
  limit = limit ? Number(limit) : 10;

  const lastPage = Math.ceil(total / limit) || 1;
  const nextPage = +page + 1 > +lastPage ? null : +page + 1;
  const prevPage = +page - 1 < 1 ? null : +page - 1;

  return {
    data: [...result],
    count: total,
    currentPage: page,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
  };
}
