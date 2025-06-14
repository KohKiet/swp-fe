import { useState, useCallback } from "react";
import ApiService from "../services/apiService";

/**
 * Custom hook for making API requests with state management
 * @returns {Object} API request state and executor functions
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Execute an API request with state management
   * @param {Function} apiMethod - The API method to call
   * @param {Array} params - Parameters to pass to the API method
   * @returns {Promise} - The API response
   */
  const execute = useCallback(async (apiMethod, ...params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiMethod(...params);
      setData(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data || err.message || "An error occurred"
      );
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Execute a GET request
   * @param {String} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - The API response
   */
  const get = useCallback(
    (endpoint, params) => {
      return execute(ApiService.get, endpoint, params);
    },
    [execute]
  );

  /**
   * Execute a POST request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} - The API response
   */
  const post = useCallback(
    (endpoint, data) => {
      return execute(ApiService.post, endpoint, data);
    },
    [execute]
  );

  /**
   * Execute a PUT request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} - The API response
   */
  const put = useCallback(
    (endpoint, data) => {
      return execute(ApiService.put, endpoint, data);
    },
    [execute]
  );

  /**
   * Execute a PATCH request
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise} - The API response
   */
  const patch = useCallback(
    (endpoint, data) => {
      return execute(ApiService.patch, endpoint, data);
    },
    [execute]
  );

  /**
   * Execute a DELETE request
   * @param {String} endpoint - API endpoint
   * @returns {Promise} - The API response
   */
  const deleteRequest = useCallback(
    (endpoint) => {
      return execute(ApiService.delete, endpoint);
    },
    [execute]
  );

  return {
    loading,
    error,
    data,
    execute,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    resetState,
  };
};

export default useApi;
