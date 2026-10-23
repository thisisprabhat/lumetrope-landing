import { OS_LABEL, publishedDownloads, type DownloadOS } from "../../config/site";
import { installStatus } from "../../content/availability";

const SIZE = (n?: number) => (n ? `${(n / 1_048_576).toFixed(1)} MB` : "");

/** What the current release publishes for one OS: a status line first, then the real files. */
export default function Builds({ os }: { os: DownloadOS }) {
  const list = publishedDownloads();
  const of = list.filter((d) => d.os === os);
  return (
    <>
      <p data-builds={os}><strong>{OS_LABEL[os]} builds in this release.</strong> {installStatus(os, list)}</p>
      {of.length > 0 && (
        <table>
          <thead><tr><th>Build</th><th>File</th><th>Size</th></tr></thead>
          <tbody>
            {of.map((d) => (
              <tr key={d.file}><td>{d.label}</td><td><a href={d.url}>{d.file}</a></td><td>{SIZE(d.size)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
