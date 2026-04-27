/**
 * 所有业务模块都尽量遵循同一种形状：
 * controller 负责输入输出边界
 * service 负责业务编排
 * repository 负责持久化
 *
 * 这样后续多人并行开发时，目录结构和阅读路径是稳定的。
 */

export interface ModuleShape<TController, TService, TRepository> {
  controller: TController;
  service: TService;
  repository: TRepository;
}
