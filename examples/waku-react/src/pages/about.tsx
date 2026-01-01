import { Link } from "waku";

export default async function AboutPage() {
  const data = await getData();

  return (
    <div>
      <title>{data.title}</title>

      <Link to="/" className="mt-4 inline-block underline">
        Return home
      </Link>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: "About",
    headline: "About Waku",
    body: "The minimal React framework",
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
