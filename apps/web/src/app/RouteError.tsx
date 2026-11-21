import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

// Branded fallback, used as the route errorElement. Unknown URLs arrive as a 404 thrown by
// the `*` route's loader; anything else (a render error) is "Something went wrong".
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const heading = notFound ? 'This page could not be found' : 'Something went wrong';

  return (
    <section className="page py-16 md:py-24">
      <title>{`${notFound ? 'Not found' : 'Error'} · White Lotus`}</title>
      <p className="caps mb-3.5 text-[11px] text-gold-text">{notFound ? 'Error 404' : 'Error'}</p>
      <h1 className="mb-4 font-serif text-[40px] leading-[1.05] font-medium text-navy md:text-[64px]">
        {heading}
      </h1>
      <p className="mb-8 max-w-xl text-sm/[1.7] text-slate md:text-base/[1.7]">
        {notFound
          ? 'The address may be mistyped, or the page has moved.'
          : 'Please try again in a moment. If it keeps happening, start again from the residences.'}
      </p>
      <Link to="/" className="btn-primary">
        Back to residences
      </Link>
    </section>
  );
}
