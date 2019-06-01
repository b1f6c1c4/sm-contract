import {
  createClearCompareAction,
  createSetCompareFormAction,
  createStartCompareAction,
} from '../actions/compare';
import { Card } from '../components/Card';
import { ComparisonTable } from '../components/ComparisonTable';
import { InputField } from '../components/InputField';
import { LinkButton } from '../components/LinkButton';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { decode } from '../persistence';
import { IAnswersState } from '../reducers/answers';
import { IRootState } from '../RootState';

interface ICompareFormProps {
  readonly formSValue: string;
  readonly formMValue: string;
  readonly currentAnswers: IAnswersState;
  readonly setCompareForm: typeof createSetCompareFormAction;
  readonly startCompare: typeof createStartCompareAction;
}
interface ICompareFormState {
  readonly error: string | null;
}
class CompareFormUW extends React.Component<
  ICompareFormProps,
  ICompareFormState
> {
  public state = {
    error: null,
  };
  public shouldComponentUpdate(
    nextProps: ICompareFormProps,
    nextState: ICompareFormState,
  ) {
    return (
      (this.props.formSValue !== nextProps.formSValue) ||
      (this.props.formMValue !== nextProps.formMValue) ||
      (this.state.error !== nextState.error)
    );
  }
  private clearError = () => {
    this.setState({
      error: null,
    });
  }
  private onSFormValueChange = (newValue: string) => {
    this.clearError();
    this.props.setCompareForm('s', newValue);
  }
  private onMFormValueChange = (newValue: string) => {
    this.clearError();
    this.props.setCompareForm('m', newValue);
  }
  private onClickCompare = () => {
    let sAnswers: IAnswersState;
    let mAnswers: IAnswersState;
    try {
      sAnswers = this.props.formSValue !== ''
        ? decode(this.props.formSValue)
        : this.props.currentAnswers;
    } catch (e) {
      this.setState({
        error: t('lab.sm.compare.sError'),
      });
      return;
    }
    try {
      mAnswers = this.props.formMValue !== ''
        ? decode(this.props.formMValue)
        : this.props.currentAnswers;
    } catch (e) {
      this.setState({
        error: t('lab.sm.compare.mError'),
      });
      return;
    }
    this.props.startCompare(sAnswers, mAnswers);
  }
  public render() {
    const t = this.props.t;
    return (
      <div>
        <InputField
          label={t('lab.sm.compare.label.s')}
          value={ this.props.formSValue }
          onChange={ this.onSFormValueChange }
        />
        <InputField
          label={t('lab.sm.compare.label.m')}
          value={ this.props.formMValue }
          onChange={ this.onMFormValueChange }
        />
        <LinkButton
          children={t('lab.sm.compare.start')}
          onClick={ this.onClickCompare }
        />
        { this.state.error && <p className='error'>
          { this.state.error }
        </p> }
      </div>
    );
  }
}
const CompareForm = withTranslation()(connect((state: IRootState) => ({
  formSValue: state.compare.form.s,
  formMValue: state.compare.form.m,
  currentAnswers: state.answers,
}), {
  setCompareForm: createSetCompareFormAction,
  startCompare: createStartCompareAction,
})(CompareFormUW));

interface ICompareProps {
  readonly comparing: null | {
    s: IAnswersState,
    m: IAnswersState,
  };
  readonly clearCompare: typeof createClearCompareAction;
}
class CompareUW extends React.PureComponent<ICompareProps> {
  public render() {
    const t = this.props.t;
    return (
      <div className='content compare'>
        <Card>
          <h1>{ t('lab.sm.compare.title') }</h1>
          <SimpleFormat>{ t('lab.sm.compare.desc') }</SimpleFormat>
          <CompareForm/>
        </Card>
        { this.props.comparing !== null && <Card>
          <h1>{ t('lab.sm.compare.table.title') }</h1>
          <LinkButton
            children={t('lab.sm.compare.table.clear')}
            onClick={ this.props.clearCompare }
          />
          <ComparisonTable
            s={ this.props.comparing.s }
            m={ this.props.comparing.m }
          />
        </Card> }
      </div>
    );
  }
}
export const Compare = withTranslation()(connect((state: IRootState) => ({
  comparing: state.compare.comparing,
}), {
  clearCompare: createClearCompareAction,
})(CompareUW));
