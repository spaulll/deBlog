type RequestOptions = {
    url: string; // `url` must be a string
    params?: Record<string, any>; // `params` is optional and can be a record of key-value pairs
    headers?: Record<string, string>; // Optional headers
  };
  
  export async function get({ url, params, headers }: RequestOptions): Promise<any> {
    const response = await fetch(url + "?" + new URLSearchParams(params || {}), {
      method: "GET",
      headers,
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  
    return await response.json();
  }
  
  export async function post({ url, params, headers }: RequestOptions): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(params || {}),
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  
    return await response.json();
  }
  