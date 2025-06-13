import { Box, Text, Heading, UnorderedList, OrderedList, ListItem, Code, Link } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A custom Markdown renderer that doesn't require external dependencies
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // If there is no content, return nothing
  if (!content) return null;

  // Split content into lines
  const lines = content.split('\n');
  const elements: ReactNode[] = [];

  // Process each line
  let currentParagraph = '';
  let inCodeBlock = false;
  let codeBlockContent = '';
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ordered' | 'unordered' = 'unordered';

  // Function to process inline formatting
  const processInlineFormatting = (text: string): ReactNode[] => {
    // Process inline code (`code`)
    const processCode = (str: string): ReactNode[] => {
      let result: ReactNode[] = [];
      let inCode = false;
      let codeContent = '';
      let regularText = '';
      
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '`' && (!inCode || str[i-1] !== '\\')) {
          if (inCode) {
            // End of inline code
            if (regularText) {
              result.push(regularText);
              regularText = '';
            }
            result.push(<Code key={i} bg="gray.700" px={1} borderRadius="md">{codeContent}</Code>);
            codeContent = '';
            inCode = false;
          } else {
            // Start of inline code
            if (regularText) {
              result.push(regularText);
              regularText = '';
            }
            inCode = true;
          }
        } else if (inCode) {
          codeContent += str[i];
        } else {
          regularText += str[i];
        }
      }
      
      if (regularText) {
        result.push(regularText);
      }
      if (codeContent) {
        // If we have unclosed code, treat as regular text
        result.push('`' + codeContent);
      }
      
      return result;
    };
    
    // Process bold and italic text
    const processBoldItalic = (nodes: ReactNode[]): ReactNode[] => {
      return nodes.map(node => {
        if (typeof node !== 'string') return node;
        
        const str = node as string;
        let result: ReactNode[] = [];
        let boldText = '';
        let italicText = '';
        let regularText = '';
        let inBold = false;
        let inItalic = false;
        
        for (let i = 0; i < str.length; i++) {
          // Check for bold (**text**)
          if (str.substring(i, i+2) === '**' && (i === 0 || str[i-1] !== '\\')) {
            if (inBold) {
              // End of bold
              if (regularText) {
                result.push(regularText);
                regularText = '';
              }
              result.push(<Box as="span" key={i} fontWeight="bold">{boldText}</Box>);
              boldText = '';
              inBold = false;
              i++; // Skip the second *
            } else {
              // Start of bold
              if (regularText) {
                result.push(regularText);
                regularText = '';
              }
              inBold = true;
              i++; // Skip the second *
            }
          } 
          // Check for italic (_text_)
          else if ((str[i] === '_' || str[i] === '*') && 
                   (i === 0 || str[i-1] !== '\\') && 
                   (!inBold || (inBold && str.substring(i, i+2) !== '**'))) {
            if (inItalic) {
              // End of italic
              if (regularText) {
                result.push(regularText);
                regularText = '';
              }
              result.push(<Box as="span" key={i} fontStyle="italic">{italicText}</Box>);
              italicText = '';
              inItalic = false;
            } else {
              // Start of italic
              if (regularText) {
                result.push(regularText);
                regularText = '';
              }
              inItalic = true;
            }
          } else if (inBold) {
            boldText += str[i];
          } else if (inItalic) {
            italicText += str[i];
          } else {
            regularText += str[i];
          }
        }
        
        if (regularText) {
          result.push(regularText);
        }
        if (boldText) {
          // If we have unclosed bold, treat as regular text
          result.push('**' + boldText);
        }
        if (italicText) {
          // If we have unclosed italic, treat as regular text
          result.push('*' + italicText);
        }
        
        return result;
      }).flat();
    };
    
    // Process links
    const processLinks = (nodes: ReactNode[]): ReactNode[] => {
      return nodes.map((node, index) => {
        if (typeof node !== 'string') return node;
        
        const str = node as string;
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        let match;
        let result: ReactNode[] = [];
        
        while ((match = linkRegex.exec(str)) !== null) {
          if (match.index > lastIndex) {
            result.push(str.substring(lastIndex, match.index));
          }
          
          const linkText = match[1];
          const url = match[2];
          
          result.push(
            <Link 
              key={`link-${index}-${match.index}`}
              href={url}
              color="blue.300"
              textDecoration="underline"
              isExternal
              _hover={{ color: "blue.200" }}
            >
              {linkText}
            </Link>
          );
          
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < str.length) {
          result.push(str.substring(lastIndex));
        }
        
        return result.length === 0 ? [str] : result;
      }).flat();
    };
    
    // Apply formatting in sequence
    let formatted: ReactNode[] = processCode(text);
    formatted = processBoldItalic(formatted);
    formatted = processLinks(formatted);
    
    return formatted;
  };

  lines.forEach((line, index) => {
    // Code blocks (```code```)
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        if (currentParagraph) {
          elements.push(
            <Text key={`p-${index}`} mb={3}>
              {processInlineFormatting(currentParagraph)}
            </Text>
          );
          currentParagraph = '';
        }
        inCodeBlock = true;
      } else {
        // End of code block
        elements.push(
          <Box 
            key={`code-${index}`} 
            as="pre" 
            bg="gray.800" 
            p={4} 
            borderRadius="md" 
            my={4}
            overflowX="auto"
            whiteSpace="pre-wrap"
            color="white"
            fontFamily="monospace"
          >
            {codeBlockContent}
          </Box>
        );
        codeBlockContent = '';
        inCodeBlock = false;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      return;
    }

    // Headers (# Header)
    if (line.match(/^#{1,6}\s/)) {
      if (currentParagraph) {
        elements.push(
          <Text key={`p-${index}`} mb={3}>
            {processInlineFormatting(currentParagraph)}
          </Text>
        );
        currentParagraph = '';
      }

      const level = line.match(/^(#{1,6})\s/)![1].length;
      const content = line.replace(/^#{1,6}\s+/, '');
      
      const sizes = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const sizeIndex = Math.min(level - 1, sizes.length - 1);
      
      elements.push(
        <Heading 
          key={`h${level}-${index}`} 
          as={`h${level}` as any} 
          size={sizes[sizeIndex]} 
          mt={Math.max(7 - level, 2)} 
          mb={Math.max(5 - level, 1)}
        >
          {processInlineFormatting(content)}
        </Heading>
      );
      return;
    }

    // Lists
    const unorderedListMatch = line.match(/^[\s]*[-*+][\s]+(.*)/);
    const orderedListMatch = line.match(/^[\s]*\d+\.[\s]+(.*)/);

    if (unorderedListMatch || orderedListMatch) {
      if (!inList) {
        if (currentParagraph) {
          elements.push(
            <Text key={`p-${index}`} mb={3}>
              {processInlineFormatting(currentParagraph)}
            </Text>
          );
          currentParagraph = '';
        }
        inList = true;
        listType = unorderedListMatch ? 'unordered' : 'ordered';
      }
      
      const itemContent = unorderedListMatch ? unorderedListMatch[1] : orderedListMatch![1];
      listItems.push(itemContent);
      return;
    } else if (inList && line.trim() === '') {
      // End of list
      if (listType === 'unordered') {
        elements.push(
          <UnorderedList key={`ul-${index}`} ml={5} mb={4} spacing={1}>
            {listItems.map((item, i) => (
              <ListItem key={i}>{processInlineFormatting(item)}</ListItem>
            ))}
          </UnorderedList>
        );
      } else {
        elements.push(
          <OrderedList key={`ol-${index}`} ml={5} mb={4} spacing={1}>
            {listItems.map((item, i) => (
              <ListItem key={i}>{processInlineFormatting(item)}</ListItem>
            ))}
          </OrderedList>
        );
      }
      inList = false;
      listItems = [];
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      if (currentParagraph) {
        elements.push(
          <Text key={`p-${index}`} mb={3}>
            {processInlineFormatting(currentParagraph)}
          </Text>
        );
        currentParagraph = '';
      }
      elements.push(
        <Box 
          key={`blockquote-${index}`} 
          borderLeftWidth="4px" 
          borderLeftColor="blue.400"
          paddingLeft="1rem"
          fontStyle="italic"
          my={4}
        >
          <Text>{processInlineFormatting(line.slice(2))}</Text>
        </Box>
      );
      return;
    }

    // Horizontal rule
    if (line.match(/^[\s]*[-*_]{3,}[\s]*$/)) {
      if (currentParagraph) {
        elements.push(
          <Text key={`p-${index}`} mb={3}>
            {processInlineFormatting(currentParagraph)}
          </Text>
        );
        currentParagraph = '';
      }
      elements.push(
        <Box 
          key={`hr-${index}`}
          height="2px"
          width="100%"
          bg="gray.600"
          my={4}
        />
      );
      return;
    }

    // Handle empty lines to break paragraphs
    if (line.trim() === '') {
      if (currentParagraph) {
        elements.push(
          <Text key={`p-${index}`} mb={3}>
            {processInlineFormatting(currentParagraph)}
          </Text>
        );
        currentParagraph = '';
      }
      return;
    }

    // Regular text/paragraphs
    if (currentParagraph) {
      currentParagraph += ' ' + line;
    } else {
      currentParagraph = line;
    }
  });

  // Don't forget the last paragraph
  if (currentParagraph) {
    elements.push(
      <Text key="p-final" mb={3}>
        {processInlineFormatting(currentParagraph)}
      </Text>
    );
  }

  // Handle any remaining list
  if (inList && listItems.length > 0) {
    if (listType === 'unordered') {
      elements.push(
        <UnorderedList key="ul-final" ml={5} mb={4} spacing={1}>
          {listItems.map((item, i) => (
            <ListItem key={i}>{processInlineFormatting(item)}</ListItem>
          ))}
        </UnorderedList>
      );
    } else {
      elements.push(
        <OrderedList key="ol-final" ml={5} mb={4} spacing={1}>
          {listItems.map((item, i) => (
            <ListItem key={i}>{processInlineFormatting(item)}</ListItem>
          ))}
        </OrderedList>
      );
    }
  }

  return (
    <Box>
      {elements}
    </Box>
  );
} 