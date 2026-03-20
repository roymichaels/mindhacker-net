/**
 * @module coach/CoachSlugRedirect
 * @purpose Redirect /coach/:slug to /p/:slug
 */
import { Navigate, useParams } from 'react-router-dom';

const CoachSlugRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/p/${slug || ''}`} replace />;
};

export default CoachSlugRedirect;
