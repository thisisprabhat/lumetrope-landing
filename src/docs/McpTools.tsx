import catalog from "../content/mcp-catalog.json";
import { HOST_TOOLS } from "./hostTools";

const TOOLS: { name: string; description: string }[] = [
  ...(catalog as { name: string; description: string }[]).map(({ name, description }) => ({ name, description })),
  ...HOST_TOOLS,
];

export const MCP_TOOL_COUNT = TOOLS.length;

export default function McpTools() {
  return (
    <div className="docs-table-wrap">
      <table data-mcp-tools>
        <thead>
          <tr>
            <th scope="col">Tool</th>
            <th scope="col">What it does</th>
          </tr>
        </thead>
        <tbody>
          {TOOLS.map((t) => (
            <tr key={t.name}>
              <td><code>{t.name}</code></td>
              <td>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
