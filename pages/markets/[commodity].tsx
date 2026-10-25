import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const commodity = params?.commodity as string;
  return {
    redirect: {
      destination: `/commodity/${commodity}`,
      permanent: true,
    },
  };
};

export default function RedirectPage() {
  return null;
}
