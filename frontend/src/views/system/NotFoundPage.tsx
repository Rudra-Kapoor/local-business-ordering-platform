import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-700">
            The page you’re looking for doesn’t exist (or may have moved).
          </div>
          <Link to="/">
            <Button variant="secondary">Go to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

