# Use a static local-first Cloudflare architecture

The app will be deployed as a static React application on Cloudflare Pages, with authored curriculum bundled into the client and learner progress stored only in browser storage. It will have no login, application backend, or cloud datastore, keeping hosting within the free constraint and minimizing collection of learner data; dependable offline/PWA behavior is not part of the initial guarantee.
