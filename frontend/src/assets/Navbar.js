import styled from "styled-components";

const Wrapper = styled.nav`
  height:100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-color);
  color :white;
  .nav-center {
    display: flex;
    width: 90vw;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-btn {
    background: transparent;
    border-color: transparent;
    font-size: 1.75rem;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .logo-text {
    display: none;
  }
  img {
    display: flex;
    align-items: center;
    width: 160px;
    position: relative;
  }

  .btn-container button {
    color: var(--text-color);
  }

  .btn-container {
    display: flex;
    align-items: center;
  }
  @media (min-width: 992px) {
    position: sticky;
    top: 0;
    .nav-center {
      width: 90%;
    }
   
    .logo-text {
      display: block;
    }
  }
`;
export default Wrapper;
