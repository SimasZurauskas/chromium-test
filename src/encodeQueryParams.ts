import qs from 'qs';

const stringifyConfig = {
  arrayFormat: 'brackets' as const
};

const encodeQueryParams = (queryParameters: Object) => {
  // @ts-ignore
  const removeEmpty = (obj) => {
    Object.keys(obj).forEach((k) => !obj[k] && obj[k] !== undefined && delete obj[k]);
    return obj;
  };

  const queryParams =
    queryParameters && Object.keys(queryParameters).length
      ? qs.stringify(removeEmpty(queryParameters), stringifyConfig)
      : null;
  return queryParams ? `?${queryParams}` : '';
};

export default encodeQueryParams;
