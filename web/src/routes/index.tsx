import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div style={{ padding: "2rem", maxWidth: 720 }}>
      <h1>GearHub</h1>
      <p>Wybierz aplikację:</p>
      <ul>
        <li>
          <Link to="/portal">Portal klienta</Link> — katalog i zamówienia
        </li>
        <li>
          <Link to="/intranet">Intranet</Link> — panel pracownika
        </li>
      </ul>
    </div>
  );
}
