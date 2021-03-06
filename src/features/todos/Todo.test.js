import { Route } from 'react-router-dom';
import Todos from './';
import { WithReduxAndRouter } from '../../config/test.helpers';
import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
  findByText,
} from '@testing-library/react';
import apiFirebaseMock, { saveTodos } from '../../config/api.firebase';

jest.mock('../../config/api.firebase');

describe('<Todo />', () => {
  afterEach(cleanup);
  test('should add a todo', async () => {
    apiFirebaseMock.get.mockResolvedValueOnce({ data: [] });
    const { getByPlaceholderText, getByText, getByDisplayValue } = render(
      <Route path="/todos/:filter" component={Todos} />,
      {
        wrapper: ({ children }) => (
          <WithReduxAndRouter path={['/todos/all']}>
            {children}
          </WithReduxAndRouter>
        ),
      }
    );

    fireEvent.change(getByPlaceholderText(/ajouter/i), {
      target: { value: 'test todo' },
    });
    expect(getByDisplayValue(/test todo/i)).toBeInTheDocument();
    fireEvent.click(getByText(/ajouter$/i));
    expect(saveTodos).toHaveBeenCalled();
    await waitFor(() => expect(getByText(/test todo/)).toBeInTheDocument());
  });

  test('should edit a todo', async () => {
    apiFirebaseMock.get.mockResolvedValueOnce({
      data: [{ name: 'test todo', done: false }],
    });
    const {
      getByPlaceholderText,
      getByText,
      getByDisplayValue,
      findByText,
    } = render(<Route path="/todos/:filter" component={Todos} />, {
      wrapper: ({ children }) => (
        <WithReduxAndRouter path={['/todos/all']}>
          {children}
        </WithReduxAndRouter>
      ),
    });

    await findByText(/test todo/);
    fireEvent.click(getByText(/edit/i));
    expect(getByDisplayValue(/test todo/)).toBeInTheDocument();
    fireEvent.change(getByDisplayValue(/test todo/), {
      target: { value: 'update todo' },
    });
    await waitFor(() =>
      expect(getByDisplayValue(/update todo/)).toBeInTheDocument()
    );
    fireEvent.click(getByText(/save/i));
    await findByText(/update todo/);
    expect(saveTodos).toHaveBeenCalled();
  });
});
