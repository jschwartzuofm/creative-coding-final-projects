import { Box, Flex, Grid, Heading, Separator, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom";
import { VisualizationMap } from "./const";

const Visualizations = () => {
  return (
    <Box>
      <Text fontStyle="italic" paddingY="1rem">
        (disclaimer: the visualizations below are best viewed on a laptop/desktop computer)
      </Text>
        {
          Object.entries(VisualizationMap).map((semester) => (
            <Flex key={semester[0]} flexDirection="column">
              {
                semester[1].length > 0 && (
                  <>
                    <Heading size="xl">{semester[0]}</Heading>
                    <Separator width="80%" margin="auto" border="0.5px solid black"/>
                  </>
                )
              }
              <Grid templateColumns="repeat(2, 1fr)" gap="4" width="50%" margin="auto" paddingTop="1rem">
                {
                  semester[1].length > 0 && semester[1].map((viz, index) => (
                    <Box key={index} className="jiggle-on-hover"> 
                      <Link to={viz.to}>
                        <Text margin="0.5rem 2rem">
                          {viz.title}
                        </Text>
                      </Link>
                    </Box>
                  ))
                }
              </Grid>
            </Flex>
          ))
        }
    </Box>
  )
}

export default Visualizations;