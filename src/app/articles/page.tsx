'use client';

import NextLink from 'next/link';
import { FC, useEffect, useState } from 'react';
import {
  Box,
  HStack,
  Heading,
  Image,
  Link,
  SpaceProps,
  Spinner,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  DatabaseObjectResponse,
  TextRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import Layout from '../components/Layout';

interface IBlogTags {
  tags: Array<string>;
  marginTop?: SpaceProps['marginTop'];
}

const BlogTags: React.FC<IBlogTags> = (props) => {
  return (
    <HStack spacing={2} marginTop={props.marginTop}>
      {props.tags.map((tag) => {
        return (
          <Tag size={'md'} variant="solid" colorScheme="orange" key={tag}>
            {tag}
          </Tag>
        );
      })}
    </HStack>
  );
};

const Articles: FC = () => {
  const [articles, setArticles] = useState<DatabaseObjectResponse[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data.results);
    };

    fetchArticles();
  }, []);

  if (!articles) {
    return <Spinner />;
  }

  return (
    <Layout>
      <VStack>
        {articles && articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id}>
              <p>{article.id}</p>
              <Box
                marginTop={{ base: '1', sm: '5' }}
                display="flex"
                flexDirection={{ base: 'column', sm: 'row' }}
                justifyContent="space-between"
              >
                <Box
                  display="flex"
                  flex="1"
                  position="relative"
                  alignItems="center"
                >
                  <Box
                    width={{ base: '100%', sm: '85%' }}
                    zIndex="2"
                    marginLeft={{ base: '0', sm: '5%' }}
                    marginTop="5%"
                  >
                    <Link
                      textDecoration="none"
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Image
                        borderRadius="lg"
                        transform="scale(1)"
                        src={
                          'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=800&q=80'
                        }
                        alt="some text"
                        objectFit="contain"
                        width="100%"
                        transition="0.3s ease-in-out"
                        _hover={{
                          transform: 'scale(1.1)',
                        }}
                      />
                    </Link>
                  </Box>
                  {/* <Box zIndex="1" width="100%" position="absolute" height="100%">
                  <Box backgroundSize="20px 20px" opacity="0.4" height="100%" />
                </Box> */}
                </Box>
                <Box
                  display="flex"
                  flex="1"
                  flexDirection="column"
                  justifyContent="center"
                  marginTop={{ base: '3', sm: '0' }}
                >
                  <BlogTags tags={['Engineering', 'Product']} />
                  <Heading marginTop="1">
                    <Link
                      as={NextLink}
                      href={`/article/${article.id}`}
                      textDecoration="none"
                      _hover={{ textDecoration: 'none' }}
                    >
                      {'title' in article.properties.Name &&
                      'plain_text' in
                        (article.properties.Name
                          .title[0] as TextRichTextItemResponse)
                        ? (
                            article.properties.Name
                              .title[0] as TextRichTextItemResponse
                          ).plain_text
                        : 'No date provided'}
                    </Link>
                  </Heading>
                  <Text as="p" marginTop="2" color={'gray.500'} fontSize="lg">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book.
                  </Text>
                  <h2>
                    {'date' in article.properties.create_date
                      ? article.properties.create_date.date.start
                      : 'No date provided'}
                  </h2>
                </Box>
              </Box>
            </div>
          ))
        ) : (
          <Spinner />
        )}
      </VStack>
    </Layout>
  );
};

export default Articles;
