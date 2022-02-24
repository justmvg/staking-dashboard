import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem;

  h2 {
    margin-top: 0;
  }

  button {
    width: 100%;
    margin: 0.4rem 0;
    padding: 0.75rem 0.5rem;
    border-radius: 1rem;
    font-size: 1rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    background: #f8f8f8;
    transition: background 0.15s;

    &:hover {
      background: #fafafa;
    }
  }
`;

export default Wrapper;