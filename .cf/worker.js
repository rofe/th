const handleRequest = async (eventReq, env) => {
  console.log(env);
  let json;
  if (eventReq.method === 'POST') {
    try {
      // check for turnstile token
      json = await eventReq.json();
      const token = json.data && json.data['cf-turnstile-response'];
      if (token) {
        // Validate the token by calling the
        // "/siteverify" API endpoint.
        const ip = eventReq.headers.get('CF-Connecting-IP');
        const formData = new FormData();
        formData.append('secret', env.SECRET_KEY);
        formData.append('response', token);
        formData.append('remoteip', ip);

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
          body: formData,
          method: 'POST',
        });

        const outcome = await result.json();
        if (!outcome.success) {
          // turnstile token verification failed
          return new Response('', {
            status: 400,
            headers: {
              'x-error': 'Invalid captcha token provided',
            },
          });
        }
      }
    } catch (e) {
      console.error(e);
      return new Response('', {
        status: 500,
        headers: {
          'x-error': e.message,
        },
      });
    }
  }
  const url = new URL(eventReq.url);
  url.hostname = env.ORIGIN_HOSTNAME;
  let backendReq;
  if (json) {
    backendReq = new Request(url, {
      headers: eventReq.headers,
      method: 'POST',
      body: JSON.stringify(json),
    });
  } else {
      backendReq = new Request(url, eventReq);
  }
  // => setting the x-forwarded-host request header renders the request un-purgeable via purge-by-url API:
  // https://developers.cloudflare.com/cache/how-to/purge-cache#purge-by-single-file-by-url
  // set x-forwarded-host request header for improved visibility in Coralogix
  backendReq.headers.set('x-forwarded-host', eventReq.headers.get('host'));
  const backendResp = await fetch(backendReq, {
    cf: {
      // cf doesn't cache html by default: need to override the default behaviour by setting "cacheEverything: true"
      cacheEverything: true,
    },
  });
  try {
    const resp = new Response(backendResp.body, backendResp);
    resp.headers.delete('x-robots-tag');
    return resp;
  } catch (e) {
    console.error(e);
    backendResp.headers.set('x-error', e.message);
    return backendResp;
  }
};

export default {
  fetch: handleRequest,
};
