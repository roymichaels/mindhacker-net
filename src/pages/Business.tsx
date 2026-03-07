/**
 * Business — redirects directly to the business journey.
 */
import { Navigate } from 'react-router-dom';

export default function Business() {
  return <Navigate to="/business/journey" replace />;
}
