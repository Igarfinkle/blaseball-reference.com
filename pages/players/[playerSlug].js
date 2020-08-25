import apiFetcher from "lib/api-fetcher";
import { useRouter } from "next/router";
import useSWR from "swr";

import BattingStatTable from "components/BattingStatTable";
import { Box, Heading, Text } from "@chakra-ui/core";
import ErrorPage from "next/error";
import Head from "next/head";
import Layout from "components/Layout";
import PitchingStatTable from "components/PitchingStatTable";

function getPlayerPositionGroup(player) {
  return ["rotation", "bullpen"].includes(player.position)
    ? "pitching"
    : "batting";
}

export default function PlayerPage(props) {
  const router = useRouter();

  const { data: player, error: playerError } = useSWR(
    `/players/${router.query.playerSlug}/details.json`,
    apiFetcher,
    {
      initialData: props.player,
    }
  );
  const playerPositionGroup = player ? getPlayerPositionGroup(player) : null;
  const { data: positionStats, error: positionStatsError } = useSWR(
    `/${playerPositionGroup}/${router.query.playerSlug}/summary.json`,
    apiFetcher,
    {
      initialData: props.positionStats,
    }
  );

  if (!router.isFallback && !props.player) {
    return <ErrorPage statusCode={404} />;
  }

  if (playerError || positionStatsError) {
    return (
      <Box>
        Sorry, we're currently having a siesta and couldn't load team
        information.
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{player.name} Stats - Blaseball-Reference.com</title>
        <meta
          property="og:title"
          content={`${player.name} Stats - Blaseball-Reference.com`}
          key="title"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {!player ? (
          <Box>Loading...</Box>
        ) : (
          <>
            <Heading as="h1" size="lg">
              {player.name}{" "}
              {player.isIncinerated ? (
                <Text
                  ariaLabel="incinerated"
                  as="span"
                  fontSize="xl"
                  role="emoji"
                >
                  🔥
                </Text>
              ) : null}
            </Heading>

            <Box fontSize="sm" mt={2} mb={4}>
              {player.aliases.length > 0 ? (
                <Text my={1}>
                  Aliases:{" "}
                  {player.aliases.map((alias, index) => (
                    <React.Fragment key={index}>
                      {alias}
                      {index < player.aliases.length - 1 && ", "}
                    </React.Fragment>
                  ))}
                </Text>
              ) : null}

              <Text my={1}>Team: {player.currentTeamName}</Text>

              {player.position === "rotation" ||
              player.position === "bullpen" ? (
                <Text my={1}>Position: Pitcher</Text>
              ) : null}

              {player.position === "lineup" || player.position === "bench" ? (
                <Text my={1}>Position: Fielder</Text>
              ) : null}

              <Text my={1}>
                Debut: Season {Number(player.debutSeason) + 1}, Day{" "}
                {player.debutDay + 1}
                {Number(player.debutSeason) + 1 === 2 ? "*" : null}
              </Text>
              {player.isIncinerated ? (
                <Text my={1}>
                  Last Game: Season {Number(player.lastGameSeason) + 1}, Day{" "}
                  {player.lastGameDay + 1}
                </Text>
              ) : null}

              {player.bat ? <Text my={1}>Bat: {player.bat}</Text> : null}

              {player.ritual ? (
                <Text my={1}>Ritual: {player.ritual}</Text>
              ) : null}
            </Box>

            {!positionStats ? (
              <Box>Loading position stats...</Box>
            ) : (
              <>
                {(player.position === "rotation" ||
                  player.position === "bullpen") && (
                  <Box my={4}>
                    <Heading as="h2" size="md">
                      Standard Pitching
                    </Heading>
                    <PitchingStatTable pitchingStats={positionStats} />

                    {Object.keys(positionStats.postseasons).length > 0 && (
                      <Box my={4}>
                        <Heading as="h2" size="md">
                          Postseason Pitching
                        </Heading>
                        <PitchingStatTable
                          isPostseason={true}
                          pitchingStats={positionStats}
                        />
                      </Box>
                    )}
                  </Box>
                )}

                {(player.position === "lineup" ||
                  player.position === "bench") && (
                  <Box my={4}>
                    <Heading as="h2" size="md">
                      Standard Batting
                    </Heading>
                    <BattingStatTable battingStats={positionStats} />

                    {Object.keys(positionStats.postseasons).length > 0 && (
                      <Box my={4}>
                        <Heading as="h2" size="md">
                          Postseason Batting
                        </Heading>
                        <BattingStatTable
                          isPostseason={true}
                          battingStats={positionStats}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
            <Box my={4}>
              <Text color="gray.500" fontSize="xs">
                * Based on incomplete or earliest recorded data
              </Text>
            </Box>
          </>
        )}
      </Layout>
    </>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const player = await apiFetcher(`/players/${params.playerSlug}/details.json`);
  const playerPositionGroup = getPlayerPositionGroup(player);
  const playerPositionStats = await apiFetcher(
    `/${playerPositionGroup}/${params.playerSlug}/summary.json`
  );

  return {
    props: {
      player,
      positionStats: playerPositionStats,
      preview,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const players = await apiFetcher("/players/players.json");
  const paths = players.map((player) => `/players/${player.slug}`) || [];

  return {
    paths,
    fallback: false,
  };
}