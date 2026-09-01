use clap::{Args, Parser, Subcommand, ValueEnum};
#[derive(Debug, Args)]
pub struct GlobalOpts {
    #[arg(short, long, global = true)] pub verbose: bool,
    #[arg(long, value_enum, default_value_t = ColorWhen::Auto, global = true)]
    pub color: ColorWhen,
}
#[derive(Copy, Clone, Debug, ValueEnum)] pub enum ColorWhen { Auto, Always, Never }
#[derive(Debug, Parser)] pub struct Cli {
    #[command(flatten)] pub global: GlobalOpts,
    #[command(subcommand)] pub cmd: Cmd,
}
#[derive(Debug, Subcommand)] pub enum Cmd { TagAnchor { #[command(subcommand)] sub: TagAnchorCmd } }
#[derive(Debug, Subcommand)] pub enum TagAnchorCmd { Validate(ValidateArgs) }
#[derive(Debug, Args)] pub struct ValidateArgs {
    #[arg(long, required = true)] pub jsonl: std::path::PathBuf,
    #[arg(long)] pub rules: Option<std::path::PathBuf>,
    #[arg(long, action = clap::ArgAction::SetTrue)] pub emit: bool,
    #[arg(long, action = clap::ArgAction::Set, default_value="true", num_args=0..=1, default_missing_value="true")]
    pub check: bool,
    #[arg(long)] pub sarif: Option<std::path::PathBuf>,
    #[arg(long, action = clap::ArgAction::SetTrue)] pub github_output: bool,
    #[arg(long, value_enum, default_value_t = OnViolation::Exit)] pub on_violation: OnViolation,
}
#[derive(Copy, Clone, Debug, ValueEnum)] pub enum OnViolation { Exit, Sarif, GithubOutput, All }
fn main() {
    let cli = Cli::parse();
    println!("parsed ok: {:?}", cli.cmd);
}
