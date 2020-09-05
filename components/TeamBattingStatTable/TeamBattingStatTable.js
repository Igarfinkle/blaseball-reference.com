import { commonBattingStatColumns } from "components/BattingStatTable/BattingStatTable";

import { Link } from "@chakra-ui/core";
import NextLink from "next/link";
import Table from "components/Table";
import { Tooltip } from "@chakra-ui/core";

export default function TeamBattingStatTable({
  isPostseason = false,
  battingStats,
  season,
}) {
  if (
    !battingStats ||
    (!isPostseason &&
      (!battingStats.seasons ||
        Object.keys(battingStats.seasons).length === 0)) ||
    (isPostseason &&
      (!battingStats.postseasons ||
        Object.keys(battingStats.postseasons).length === 0))
  ) {
    return null;
  }

  const data = React.useMemo(() => {
    const seasons = isPostseason
      ? battingStats.postseasons
      : battingStats.seasons;

    if (!season) {
      const season = Object.keys(seasons).sort().pop();
    }

    return seasons[season].map((player) => {
      return {
        ...player,
        season,
      };
    });
  }, [season]);

  const columns = React.useMemo(
    () =>
      [
        {
          accessor: "name",
          Header: (
            <Tooltip hasArrow label="Team" placement="top">
              Player
            </Tooltip>
          ),
          Cell: ({ row, value }) => {
            return row.original?.slug ? (
              <NextLink
                href="/players/[playerId]"
                as={`/players/${row.original.slug}`}
                passHref
              >
                <Link>{value}</Link>
              </NextLink>
            ) : null;
          },
        },
      ].concat(commonBattingStatColumns()),
    []
  );

  return <Table columns={columns} data={data} />;
}
