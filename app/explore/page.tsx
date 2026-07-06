import { ExplorerClient } from "./ExplorerClient";

export const metadata = {
  title: "Color Explorer — 144,000 Color Project",
  description: "Browse all 13 color groups, 144 sub-classes, and 1,000 variants with render mode visualization.",
};

export default function ExplorePage() {
  return <ExplorerClient />;
}
