import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import parse, { domToReact } from 'html-react-parser';
import GlobalStyle from './globalStyles';

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-bottom: 20px;
`;

const type = keyframes`
  0% {width: 0;}
  99.9% {border-right: .15em solid orange;}
  100% {border: none;}
`;

const type2 = keyframes`
  0% {width: 0;}
  1% {opacity: 1;}
  99.9% {border-right: .15em solid orange;}
  100% {border: none; opacity: 1;}
`;

const Line = styled.p`
  border-right: solid 3px orange;
  white-space: nowrap;
  margin: 4px 0;
  overflow: hidden;    
  font-family: 'Source Code Pro', monospace;  
  font-size: 16px; /* Adjust this to your preferred font size */
  line-height: 1.2; /* Adjust this to your preferred line height */
  color: rgba(255,255,255,.70);
  width: ${props => props.width}em;
  opacity: ${props => props.opacity};
  animation: ${props => css`${props.animation}`};
  animation-fill-mode: forwards;
  text-indent: ${props => props.indent}em;
  // text-indent: 2em;
`;

const KeywordSpan = styled.span`
  color: #569cd6;
`;

const StringSpan = styled.span`
  color: #CD8B5A;
`;

const MethodSpan = styled.span`
  color: #dcdbad;
`;

const VariableSpan = styled.span`
  color: #9DDDFC;
`;

const ModuleSpan = styled.span`
  color: #52C9B1;
`;

const CommentSpan = styled.span`
  color: #5a965a;
`;

// purple (return): #c487be
// def blue: #4193d3
// comment #5a965a
// modules / imports: #52C9B1
// variable: #9DDDFC



function App() {
  const [code, setCode] = useState('');
  const [animatedCode, setAnimatedCode] = useState(''); // new state variable

  const handleChange = async (e) => {
    setCode(e.target.value);

    try {
      const response = await axios.post('http://localhost:5000/convert', { code: e.target.value });
      setAnimatedCode(response.data.html); // set animatedCode when OpenAI response is received
      console.log(response.data.html)
    } catch (error) {
      console.error('Error during conversion:', error);
    }
  }

  let totalDuration = 0;

  const generateAnimation = (text, index, indent) => {
    const lengthMultiplier = text.length > 35 ? 0.65 : 0.7;
    const width = (parseInt(Math.floor(text.length * lengthMultiplier)) + parseInt(indent)).toString();
    // console.log("Width", width)
    // console.log("Width + ind", width + indent)
    const duration = width / 16; /* Adjust this to speed up or slow down the animation */
    totalDuration += duration;

    const animation = index === 0
      ? css`${type} ${duration}s steps(${width}, end)`
      : css`${type2} ${duration}s steps(${width}, end) ${totalDuration - duration}s`;

    return { width, opacity: index === 0 ? 1 : 0, animation };
  }


  const options = {
    replace: ({ name, attribs, children }) => {
      if (name === 'p') {
        const index = parseInt(attribs.key, 10);

        // Create a helper function to extract all text from children
        const extractText = (nodes) => {
          return nodes.reduce((text, node) => {
            if (node.type === 'text') {
              return text + node.data;
            } else if (node.children) {
              return text + extractText(node.children);
            } else {
              return text;
            }
          }, '');
        };

        // Extract indentation
        const indent = attribs.style ? attribs.style.replace('text-indent: ', '').replace('em;', '') : 0;

        const lineText = extractText(children);
        const { width, opacity, animation } = generateAnimation(lineText, index, indent);

        return (
          <Line
            key={uuidv4()}
            width={width}
            opacity={opacity}
            animation={animation}
            indent={indent}
          >
            {domToReact(children, options)}
          </Line>
        );
      }
      if (name === 'span' && attribs.class) {
        if (attribs.class.includes('keyword')) {
          return <KeywordSpan>{domToReact(children, options)}</KeywordSpan>;
        }

        if (attribs.class.includes('string')) {
          return <StringSpan>{domToReact(children, options)}</StringSpan>;
        }

        if (attribs.class.includes('method')) {
          return <MethodSpan>{domToReact(children, options)}</MethodSpan>;
        }

        if (attribs.class.includes('variable')) {
          return <VariableSpan>{domToReact(children, options)}</VariableSpan>;
        }

        if (attribs.class.includes('comment')) {
          return <CommentSpan>{domToReact(children, options)}</CommentSpan>;
        }

        if (attribs.class.includes('module')) {
          return <ModuleSpan>{domToReact(children, options)}</ModuleSpan>;
        }
      }
    },
  };

  const lines = parse(animatedCode, options);

  return (
    <div className="App">
      <GlobalStyle />
      <TextArea value={code} onChange={handleChange} />
      {lines}
    </div>
  );
}

export default App;



  // const lines = animatedCode.split('\n').map((line, index) => {
  //   const { width, opacity, animation } = generateAnimation(line, index);
  //   return <Line key={index} width={width} opacity={opacity} animation={animation}>{line}</Line>;
  // });