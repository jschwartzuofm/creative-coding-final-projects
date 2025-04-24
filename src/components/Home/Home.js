import { Flex, Heading, Image } from "@chakra-ui/react";
import AboutDrawer from "./AboutDrawer";
import Visualizations from "./Visualizations";

const Home = () => {
  return (
    <div className="p-8">
      <a href="https://taubmancollege.umich.edu/urban-technology/">
        <Image src={require('../../taubman_college.png')} alt="taubman_college_logo" margin="auto" width="35%" paddingTop="2rem" />
      </a>
      <Flex justifyContent="center" alignItems="center" paddingTop="2rem">
        <Heading marginRight="1rem" size="3xl">
          Welcome to the UT 402.001 "Creative Coding" Final Project Archive
        </Heading>
        <AboutDrawer />
      </Flex>
      <Visualizations />
    </div>
  );
};

export default Home;
