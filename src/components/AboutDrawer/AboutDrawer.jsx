import { useLocation } from 'react-router-dom';
import {
  Button,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  Portal,
  Text
} from "@chakra-ui/react"
import { VisualizationMap } from '../Home/const';
import './AboutDrawer.css'

const AboutDrawer = ({ semester = "Winter 2025", id = "home" }) => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  const viz = VisualizationMap[semester].find((viz) => id === viz.id);

  if (isHomepage) {
    return (
      <Drawer.Root size="md">
        <Drawer.Trigger asChild>
          <Button variant="outline" size="sm"  bg="transparent" _hover={{ bg: "white" }} border="1px solid white">
            About
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>About UT 402 "Creative Coding"</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Text textAlign="left" fontSize="18px">
                  Welcome to the UT 402 "Creative Coding" Final Project Archive. Here you'll find beautiful, thought-provoking data visualizations built by students pursuing the <a href="https://taubmancollege.umich.edu/urban-technology/" target="_blank" rel="noreferrer" className="taubman-link">University of Michigan's B.S. of Urban Technology.</a>
                </Text>
                <Text textAlign="left" fontSize="18px" marginTop="1.5rem">
                  UT 402 "Creative Coding" offers students an introduction to data visualization and mapping with some attention to front-end web development. In this course, students begin by learning the building blocks of the web - HTML, CSS, and Javascript, and then dive deeper into D3.js - a widely used tool for data visualization.
                </Text>
                <Text textAlign="left" fontSize="18px" marginTop="1.5rem">
                  This course is part of the University of Michigan's trailblazing Urban Technology bachelor's degree, which brings together the digital and physical worlds to effect real change. We created our program for creative problem solvers who see technology as a way to improve urban life. You will learn to create apps, launch businesses, and design services and organizations that address critical urban challenges such as climate change, equitable housing, and mobility.
                </Text>
                <a href="https://taubmancollege.umich.edu/urban-technology/" target="_blank" rel="noreferrer">
                  <Text textAlign="left" marginTop="1rem" fontSize="18px"
                  color="blue">Want to learn more? Click here.</Text>                
                </a>
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    )
  }

  return (
    <Drawer.Root size="md">
      <Drawer.Trigger asChild>
        <Button variant="outline" size="sm"  bg="transparent" _hover={{ bg: "white" }} border="1.5px solid black">
          More about this viz
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{viz.title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Text textAlign="left" fontSize="18px">
                {viz.description}
              </Text>
              <Heading size="md" marginTop="2rem" textAlign="left">
                Authors:
              </Heading>
              <Flex flexDirection="column">
                {viz.authors.map((author, index) => (
                  <Flex key={index} alignItems="center" marginTop="1rem"  _first={{ marginTop: "0.25rem" }}>
                    <Text textAlign="left" fontSize="18px" marginRight="1rem">
                      {author.name}
                    </Text>
                    <a href={author.link} target="_blank" rel="noreferrer">
                      <Text textAlign="left" fontSize="18px"
                      color="blue">LinkedIn</Text>                
                    </a>
                  </Flex>
                ))}
              </Flex>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
};

export default AboutDrawer;
